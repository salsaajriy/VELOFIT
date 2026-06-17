<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Support\Carbon;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function update(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'name' => 'nullable|string|max:100',
            'weight' => 'nullable|numeric',
            'height' => 'nullable|numeric',
            'birth_date' => 'nullable|date',    
            'gender' => 'nullable|in:male,female',
            'contact1' => 'nullable|string',
            'contact2' => 'nullable|string',
            'name1' => 'nullable|string',
            'name2' => 'nullable|string',
        ]);

        $user->update($data);

        return response()->json([
            'status' => true,
            'message' => 'Profile updated successfully.',
            'data' => $user
        ]);
    }

    public function show(Request $request)
    {
        $user = $request->user();
        
        $userData = $user->toArray();
        $userData['age'] = $user->birth_date 
        ? Carbon::parse($user->birth_date)->age 
        : null;

        $userData['profile_completed'] = (
            !is_null($user->weight) &&
            !is_null($user->height)
        );
        return response()->json([
            'status' => true,
            'message' => 'User profile information',
            'data' => $userData
        ]);
    }
}
