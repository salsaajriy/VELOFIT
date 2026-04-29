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
            ->orderByDesc('last_seen')
            ->get()
            ->map(fn($h) => $this->formatHelmet($h));

        return response()->json(['data' => $helmets]);
    }

    // POST /api/helmets — Pair device
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'device_id' => 'required|string|unique:helmets,device_id',
            'name'      => 'required|string|max:100',
        ]);

        $helmet = Helmet::create([
            'user_id'   => $request->user()->id,
            'device_id' => $request->device_id,
            'name'      => $request->name,
            'battery'   => 0,
            'connection'=> 'offline',
            'is_active' => false,
        ]);

        return response()->json([
            'message' => 'Helmet paired successfully.',
            'data'    => $this->formatHelmet($helmet),
        ], 201);
    }

    // PUT /api/helmets/{id} — Update nama
    public function update(Request $request, int $id): JsonResponse
    {
        $helmet = Helmet::where('user_id', $request->user()->id)->findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:100',
        ]);

        $helmet->update(['name' => $request->name]);

        return response()->json([
            'message' => 'Helmet updated.',
            'data'    => $this->formatHelmet($helmet->fresh()),
        ]);
    }

    // PATCH /api/helmets/{id}/activate — Set active
    public function activate(Request $request, int $id): JsonResponse
    {
        $helmet = Helmet::where('user_id', $request->user()->id)->findOrFail($id);

        // Nonaktifkan semua helm user ini
        Helmet::where('user_id', $request->user()->id)->update(['is_active' => false]);

        // Aktifkan helm yang dipilih
        $helmet->update(['is_active' => true]);

        return response()->json([
            'message' => "Helmet '{$helmet->name}' is now active.",
            'data'    => $this->formatHelmet($helmet->fresh()),
        ]);
    }

    // DELETE /api/helmets/{id} — Unpair
    public function destroy(Request $request, int $id): JsonResponse
    {
        $helmet = Helmet::where('user_id', $request->user()->id)->findOrFail($id);
        $helmet->delete();

        return response()->json(['message' => 'Helmet unpaired successfully.']);
    }

    // -----------------------------------------------
    // ENDPOINT UNTUK DEVICE (tidak perlu auth user)
    // POST /api/helmet-data
    // -----------------------------------------------
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
            'last_seen'  => now(),
            // connection dihitung via accessor, tapi kita simpan juga ke DB
            // untuk query langsung tanpa accessor
            'connection' => 'connected',
        ]);

        return response()->json(['message' => 'Data received.']);
    }

    private function formatHelmet(Helmet $helmet): array
    {
        return [
            'id'         => $helmet->id,
            'deviceId'   => $helmet->device_id,
            'name'       => $helmet->name,
            'battery'    => $helmet->battery,
            'connection' => $helmet->connection, // pakai accessor
            'isActive'   => $helmet->is_active,
            'lastSeen'   => $helmet->last_seen?->toIso8601String(),
            'batteryLow' => $helmet->battery < 20,
        ];
    }
}