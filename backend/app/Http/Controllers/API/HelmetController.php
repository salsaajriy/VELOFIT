<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreHelmetRequest;
use App\Http\Requests\ValidateHelmetConnectionRequest;
use App\Http\Resources\HelmetResource;
use App\Models\Helmet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HelmetController extends Controller
{
    /**
     * GET /api/helmets
     * List all helmets registered to the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $helmets = $request->user()
                           ->helmets()
                           ->orderBy('created_at')
                           ->get();

        return response()->json([
            'data' => HelmetResource::collection($helmets),
        ]);
    }

    /**
     * POST /api/helmets
     * Register a helmet and attach it to the user.
     * Creates the helmet record if it doesn't exist yet.
     */
    public function store(StoreHelmetRequest $request): JsonResponse
    {
        $exists = Helmet::where('user_id', $request->user()->id)
            ->where('bluetooth_device_name', $request->bluetooth_device_name)
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Helmet is already registered to your account.'
            ], 409);
        }

        $helmet = Helmet::create([
            'user_id' => $request->user()->id,
            'helmet_name' => $request->helmet_name,
            'bluetooth_device_name' => $request->bluetooth_device_name,
            'is_active' => false,
        ]);

        return response()->json([
            'message' => 'Helmet registered successfully.',
            'data' => new HelmetResource($helmet),
        ], 201);
    }

public function destroy(Request $request, Helmet $helmet): JsonResponse
{
    if ($helmet->user_id !== $request->user()->id) {
        return response()->json([
            'message' => 'Helmet not found in your account'
        ], 403);
    }

    $helmet->delete();

    return response()->json([
        'message' => 'Helmet removed from your account.',
    ]);
}

    /**
     * POST /api/helmets/validate-connection
     * Validate that a BLE device name belongs to one of the user's helmets.
     * Called after BLE connection is established on frontend.
     */
    public function validateConnection(ValidateHelmetConnectionRequest $request): JsonResponse
    {
        $helmet = $request->user()
                          ->helmets()
                          ->where('bluetooth_device_name', $request->bluetooth_device_name)
                          ->first();

        if (! $helmet) {
            return response()->json([
                'valid'   => false,
                'message' => 'This helmet is not registered to your account.',
            ], 403);
        }

        return response()->json([
            'valid'   => true,
            'message' => 'Helmet connected successfully.',
            'data'    => new HelmetResource($helmet),
        ]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        // Cari helmet berdasarkan ID
        $helmet = Helmet::find($id);
        
        if (!$helmet) {
            return response()->json(['message' => 'Helmet not found'], 404);
        }
        
        if ($helmet->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Helmet not found in your account'], 403);
        }

        // Validate request
        $validated = $request->validate([
            'helmet_name' => 'required|string|max:100',
        ]);

        // Update helmet name
        $helmet->update($validated);
        
        // Refresh model
        $helmet->fresh();

        return response()->json([
            'message' => 'Helmet name updated successfully.',
            'data' => $helmet
        ]);
    }

    public function adminIndex(Request $request): JsonResponse
    {
        $helmets = Helmet::with(['user' => function($query) {
            $query->select('id', 'name', 'email');
        }])
        ->orderByDesc('is_active')
        ->orderByDesc('created_at')
        ->get()
        ->map(function($helmet) {
            return [
                'id' => $helmet->id,
                'helmet_name' => $helmet->helmet_name,
                'bluetooth_device_name' => $helmet->bluetooth_device_name,
                'is_active' => (bool) $helmet->is_active,
                'created_at' => $helmet->created_at->toIso8601String(),
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