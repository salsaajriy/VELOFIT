<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Helmet;

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
    
    // Index untuk admin (semua user)
    public function index(Request $request)
    {
        $users = User::with(['helmets' => function($query) {
            $query->select('id', 'user_id', 'device_id', 'device_name', 'battery', 'is_active', 'last_ping');
        }])->select('id', 'name', 'email', 'role', 'created_at')
          ->get();
        
        // Transform data agar helmet info lebih rapi
        $result = $users->map(function($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'join_date' => $user->created_at,
                'helmets' => $user->helmets->map(function($helmet) {
                    return [
                        'id' => $helmet->id,
                        'device_id' => $helmet->device_id,
                        'device_name' => $helmet->device_name,
                        'battery' => $helmet->battery,
                        'battery_low' => $helmet->battery < 20,
                        'is_active' => (bool) $helmet->is_active,
                        'last_ping' => $helmet->last_ping?->toIso8601String(),
                        'status' => $this->getHelmetStatus($helmet),
                    ];
                }),
                'has_helmet' => $user->helmets->count() > 0,
                'active_helmet' => $user->helmets->where('is_active', true)->first() 
                    ? [
                        'device_name' => $user->helmets->where('is_active', true)->first()->device_name,
                        'battery' => $user->helmets->where('is_active', true)->first()->battery,
                    ] 
                    : null,
            ];
        });
        
        if ($request->has('role') && in_array($request->role, ['admin', 'user'])) {
            $result = $result->filter(fn($u) => $u['role'] === $request->role);
        } else {
            $result = $result->filter(fn($u) => $u['role'] !== 'admin');
        }
        
        return response()->json([
            'status' => true,
            'total' => $result->count(),
            'data' => $result->values(),
        ]);
    }
    
    private function getHelmetStatus($helmet)
    {
        if (!$helmet->is_active) {
            return 'inactive';
        }
        
        if ($helmet->last_ping && $helmet->last_ping->diffInMinutes(now()) > 10) {
            return 'offline';
        }
        
        if ($helmet->battery < 20) {
            return 'low_battery';
        }
        
        return 'online';
    }
}