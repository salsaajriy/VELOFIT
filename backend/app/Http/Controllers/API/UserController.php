<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Helmet;
use App\Models\Ride;
use App\Models\Target;
use App\Models\SensorReading;

class UserController extends Controller
{
    public function dashboard(Request $request)
    {
        $user = $request->user();

        // Gunakan with() untuk eager loading jika perlu
        $lastRide = Ride::where('user_id', $user->id)
            ->where('status', 'completed')
            ->latest('created_at') // lebih spesifik
            ->first();

        $temperature = null;

        if ($lastRide) {
            $temperature = $lastRide->sensorReadings()
                ->latest('recorded_at')
                ->first();
        }

        $target = Target::where('user_id', $user->id)
            ->latest('created_at')
            ->first();

        $helmet = Helmet::where('user_id', $user->id)
            ->latest('created_at')
            ->first();

        // Perhitungan progress dengan validasi lebih baik
        $progress = 0;
        if ($target && $target->distance > 0 && $lastRide) {
            $progress = min(
                round(($lastRide->distance / $target->distance) * 100),
                100
            );
        }

        return response()->json([
            'status' => true,
            'message' => 'Dashboard data retrieved successfully',
            'data' => [
                'summary' => [
                    'distance' => $lastRide?->distance ?? 0,
                    'calories' => $lastRide?->calories ?? 0,
                    'duration' => $lastRide?->duration ?? 0,
                    'helmet' => [
                        'name' => $helmet?->bluetooth_device_name ?? 'No helmet connected',
                        'battery' => $helmet?->battery_level ?? 0
                    ],
                    'goal' => [
                        'target_distance' => $target?->distance ?? 0,
                        'progress' => $progress
                    ],
                    'temperature' => $temperature?->body_temperature ?? 0
                ]
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
            $query->select('id', 'user_id', 'helmet_name', 'is_active');
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
                        'helmet_name' => $helmet->helmet_name,
                        // 'battery' => $helmet->battery,
                        // 'battery_low' => $helmet->battery < 20,
                        'is_active' => (bool) $helmet->is_active,
                    ];
                }),
                'has_helmet' => $user->helmets->count() > 0,
                'active_helmet' => $user->helmets->where('is_active', true)->first() 
                    ? [
                        'helmet_name' => $user->helmets->where('is_active', true)->first()->helmet_name,
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
        
        // if ($helmet->battery < 20) {
        //     return 'low_battery';
        // }
        
        return 'online';
    }
}