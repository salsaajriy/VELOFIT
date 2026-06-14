<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StartRideRequest;
use App\Http\Requests\StoreSensorDataRequest;
use App\Http\Resources\RideDetailResource;
use App\Http\Resources\RideResource;
use App\Models\Ride;
use App\Services\RideService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RideController extends Controller
{
    public function __construct(private RideService $rideService) {}

    public function start(StartRideRequest $request): JsonResponse
    {
        // Block if user already has an active ride
        $existing = $request->user()
                            ->rides()
                            ->where('status', 'active')
                            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'You already have an active ride.',
                'data'    => new RideResource($existing),
            ], 409);
        }

        // Verify the helmet belongs to the user
        $ownsHelmet = $request->user()
                              ->helmets()
                              ->where('id', $request->helmet_id)
                              ->exists();

        if (! $ownsHelmet) {
            return response()->json([
                'message' => 'Helmet does not belong to your account.',
            ], 403);
        }

        $ride = Ride::create([
            'user_id'    => $request->user()->id,
            'helmet_id'  => $request->helmet_id,
            'start_time' => now(),
            'status'     => 'active',
        ]);

        return response()->json([
            'message' => 'Ride started.',
            'data'    => new RideResource($ride->load('helmet')),
        ], 201);
    }

    /**
     * POST /api/rides/{ride}/sensor-data
     * Accept one BLE payload, split and store into ride_locations + sensor_readings.
     */
    public function storeSensorData(StoreSensorDataRequest $request, Ride $ride): JsonResponse
    {
        // Ownership check
        if ($ride->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        if ($ride->status !== 'active') {
            return response()->json(['message' => 'Ride is not active.'], 422);
        }

        $this->rideService->storeSensorPayload($ride, $request->validated());

        return response()->json(['message' => 'Sensor data stored.']);
    }

    public function finish(Request $request, Ride $ride): JsonResponse
    {
        if ($ride->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        if ($ride->status !== 'active') {
            return response()->json(['message' => 'Ride is already completed.'], 422);
        }

        $finished = $this->rideService->finaliseRide($ride);

        return response()->json([
            'message' => 'Ride finished.',
            'data'    => new RideResource($finished->load('helmet')),
        ]);
    }

    public function active(Request $request): JsonResponse
    {
        $ride = $request->user()
                        ->rides()
                        ->where('status', 'active')
                        ->with('helmet')
                        ->first();

        if (! $ride) {
            return response()->json(['data' => null]);
        }

        return response()->json(['data' => new RideResource($ride)]);
    }

    public function history(Request $request): JsonResponse
    {
        $rides = $request->user()
                         ->rides()
                         ->where('status', 'completed')
                         ->with('helmet')
                         ->orderByDesc('start_time')
                         ->paginate(15);

        return response()->json([
            'data' => RideResource::collection($rides),
            'meta' => [
                'current_page' => $rides->currentPage(),
                'last_page'    => $rides->lastPage(),
                'total'        => $rides->total(),
            ],
        ]);
    }

    public function show(Request $request, Ride $ride): JsonResponse
    {
        if ($ride->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $ride->load(['helmet', 'locations', 'sensorReadings']);

        return response()->json([
            'data' => new RideDetailResource($ride),
        ]);
    }

    public function cancel(Request $request): JsonResponse
    {
        $ride = Ride::where('user_id', $request->user()->id)
            ->where('status', 'active')
            ->firstOrFail();

        $ride->update(['status' => 'cancelled']);

        return response()->json([
            'status' => true,
            'message' => 'Ride cancelled successfully',
        ]);
    }
}