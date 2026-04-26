<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    // 🔹 GET profile user login
    public function show(Request $request)
    {
        return response()->json($request->user());
    }

    // 🔹 UPDATE profile
    public function update(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'name' => 'nullable|string|max:100',
            'weight' => 'nullable|numeric',
            'height' => 'nullable|numeric',
            'contact1' => 'nullable|string',
            'contact2' => 'nullable|string',
            'name1' => 'nullable|string',
            'name2' => 'nullable|string',
        ]);

        $user->update($data);

        return response()->json([
            'message' => 'Profile updated',
            'data' => $user
        ]);
    }
}
