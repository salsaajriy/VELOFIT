<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Helmet;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class HelmetController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $helmets = Helmet::where('user_id', $request->user()->id)
            ->orderByDesc('is_active')
            ->get()
            ->map(fn($h) => $this->formatHelmet($h));

        return response()->json(['data' => $helmets]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'device_id' => 'required|string|unique:helmets,device_id',
            'device_name' => 'required|string|max:100',
        ]);

        $helmet = Helmet::create([
            'user_id'   => $request->user()->id,
            'device_id' => $request->device_id,
            'device_name' => $request->device_name,
            'battery'   => 0,
            'connection'=> 'offline',
            'is_active' => false,
        ]);

        return response()->json([
            'message' => 'Helmet paired successfully.',
            'data'    => $this->formatHelmet($helmet),
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $helmet = Helmet::where('user_id', $request->user()->id)->findOrFail($id);

        $request->validate([
            'device_name' => 'required|string|max:100',
        ]);

        $helmet->update(['device_name' => $request->device_name]);

        return response()->json([
            'message' => 'Helmet updated.',
            'data'    => $this->formatHelmet($helmet->fresh()),
        ]);
    }

    public function activate(Request $request, int $id): JsonResponse
    {
        $helmet = Helmet::where('user_id', $request->user()->id)->findOrFail($id);

        Helmet::where('user_id', $request->user()->id)->update(['is_active' => false]);

        $helmet->update(['is_active' => true]);

        return response()->json([
            'message' => "Helmet '{$helmet->device_name}' is now active.",
            'data'    => $this->formatHelmet($helmet->fresh()),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $helmet = Helmet::where('user_id', $request->user()->id)->findOrFail($id);
        $helmet->delete();

        return response()->json(['message' => 'Helmet unpaired successfully.']);
    }

    public function receiveData(Request $request): JsonResponse
    {
        $request->validate([
            'device_id' => 'required|string',
            'battery'   => 'required|integer|between:0,100',
        ]);

        $helmet = Helmet::where('device_id', $request->device_id)->first();

        if (!$helmet) {
            Log::warning('Unknown device sent data', ['device_id' => $request->device_id]);
            return response()->json(['message' => 'Device not registered.'], 404);
        }

        $helmet->update([
            'battery'    => $request->battery,
            'last_ping'  => now(),
        ]);

        return response()->json(['message' => 'Data received.']);
    }

    private function formatHelmet(Helmet $helmet): array
    {
        return [
            'id'         => $helmet->id,
            'deviceId'   => $helmet->device_id,
            'deviceName' => $helmet->device_name,
            'battery'    => $helmet->battery,
            'isActive'   => $helmet->is_active,
            'lastPing'   => $helmet->last_ping?->toIso8601String(),
            'batteryLow' => $helmet->battery < 20,
        ];
    }

    public function adminIndex(Request $request): JsonResponse
    {
        $helmets = Helmet::with(['user' => function($query) {
            $query->select('id', 'name', 'email');
        }])->orderByDesc('is_active')
        ->orderByDesc('last_ping')
        ->get()
        ->map(function($helmet) {
            return [
                'id' => $helmet->id,
                'device_id' => $helmet->device_id,
                'device_name' => $helmet->device_name,
                'battery' => $helmet->battery,
                'battery_low' => $helmet->battery < 20,
                'is_active' => (bool) $helmet->is_active,
                'last_ping' => $helmet->last_ping?->toIso8601String(),
                'status' => $helmet->status,
                'owner' => $helmet->user ? [
                    'id' => $helmet->user->id,
                    'name' => $helmet->user->name,
                    'email' => $helmet->user->email,
                ] : null,
            ];
        });
        
        return response()->json([
            'status' => true,
            'total' => $helmets->count(),
            'data' => $helmets,
        ]);
    }
}