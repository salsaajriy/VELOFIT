<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;

class UserController extends Controller
{
    public function dashboard(Request $request)
    {

        return response()->json([
            'status' => true,
            'message' => 'Selamat datang di dashboard user!',
            'data' => [
                'user' => $request->user(),
                'logged_in_at' => now()->toDateTimeString(),
            ]
        ]);
    }

    public function profile(Request $request)
    {
        return response()->json([
            'status' => true,
            'message' => 'Informasi profil user',
            'data' => $request->user()
        ]);
    }
    
    //hanya admin lihat semua user
    public function index()
    {
        $users = User::select('id', 'name', 'email', 'role', 'created_at')->get();
        return response()->json([
            'status' => true,
            'total'  => $users->count(),
            'data' => $users,
        ]);
    }
}
