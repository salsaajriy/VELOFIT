<?php
 
namespace App\Http\Controllers\Api;
 
use App\Http\Controllers\Controller;
use App\Http\Requests\{StartRideRequest, LocationRequest, FinishRideRequest};
use App\Http\Resources\{RideResource, RideDetailResource, RideStatsResource};
use App\Models\{Ride, Helmet};
use App\Services\RideService;
use Illuminate\Http\{JsonResponse, Request};
 
class RideController extends Controller
{
    public function __construct(private readonly RideService $rideService) {}

    public function start(StartRideRequest $request): JsonResponse
    {
        $ride = $this->rideService->startRide(
            userId: $request->user()->id,
            helmetId: $request->input('helmet_id'),
            mode: $request->input('mode', 'free'),
        );
 
        return response()->json([
            'success' => true,
            'data'    => new RideResource($ride),
            'message' => 'Ride dimulai.',
        ], 201);
    }
 
    public function location(LocationRequest $request): JsonResponse
    {
        $ride = Ride::query()
            ->where('user_id', $request->user()->id)
            ->active()
            ->latest()
            ->firstOrFail();
 
        $this->rideService->saveLocations($ride, $request->input('locations'));
 
        return response()->json(['success' => true, 'message' => 'Lokasi disimpan.']);
    }

    public function pause(Request $request, Ride $ride): JsonResponse
    {
        if ($ride->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }
        $updated = $this->rideService->pauseRide($ride);

        return response()->json([
            'success' => true,
            'data'    => new RideResource($updated),
        ]);
    }

    public function resume(Request $request, Ride $ride): JsonResponse
    {
        if ($ride->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }
        $updated = $this->rideService->resumeRide($ride);

        return response()->json([
            'success' => true,
            'data'    => new RideResource($updated),
        ]);
    }

    public function finish(FinishRideRequest $request, Ride $ride): JsonResponse
    {
        if ($ride->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $finalStats = $request->only(['distance', 'duration', 'avg_speed', 'max_speed', 'calories']);
        
        $finalRide = $this->rideService->finishRide(
            $ride,
            $finalStats
        );

        return response()->json([
            'success' => true,
            'data'    => new RideDetailResource($finalRide),
            'message' => 'Ride selesai!',
        ]);
    }
 
    public function history(Request $request): JsonResponse
    {
        $history = $this->rideService->getUserHistory(
            userId: $request->user()->id,
            perPage: (int) $request->query('per_page', 10)
        );
 
        return response()->json([
            'success' => true,
            'data'    => RideResource::collection($history),
            'meta'    => [
                'current_page' => $history->currentPage(),
                'last_page'    => $history->lastPage(),
                'total'        => $history->total(),
            ],
        ]);
    }
 
    public function show(Request $request, int $rideId): JsonResponse
    {
        $ride = $this->rideService->getRideDetail($rideId, $request->user()->id);
 
        if (!$ride) {
            return response()->json(['success' => false, 'message' => 'Ride tidak ditemukan.'], 404);
        }
 
        return response()->json([
            'success' => true,
            'data'    => new RideDetailResource($ride),
        ]);
    }

    public function destroy(Request $request, Ride $ride): JsonResponse
    {
        if ($ride->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $ride->delete();

        return response()->json([
            'success' => true,
            'message' => 'Successfully deleted the ride.'
        ]);
    }

    public function active(Request $request): JsonResponse
    {
        $ride = Ride::query()
            ->where('user_id', $request->user()->id)
            ->active()
            ->latest()
            ->first();

        return response()->json([
            'success' => true,
            'data' => $ride
                ? new RideResource($ride)
                : null,
        ]);
    }

    public function stats(Request $request): JsonResponse
    {
        $stats = $this->rideService->getStats(
            $request->user()->id
        );

        return response()->json([
            'success' => true,
            'data' => new RideStatsResource($stats),
        ]);
    }
}
