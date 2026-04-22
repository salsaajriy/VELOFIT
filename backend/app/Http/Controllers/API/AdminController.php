<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;

class AdminController extends Controller
{
    public function dashboard(Request $request)
    {
        $totalUsers = User::where('role', 'user')->count();
        $totalAdmins = User::where('role', 'admin')->count();

        return response()->json([
            'status' => true,
            'message' => 'Selamat datang di dashboard admin!',
            'data' => [
                'admin' => $request->user(),
                'status' => [
                    'total_users' => $totalUsers,
                    'total_admins' => $totalAdmins,
                ],
                'logged_in_at' => now()->toDateTimeString(),
            ]
        ]);
    }
}
