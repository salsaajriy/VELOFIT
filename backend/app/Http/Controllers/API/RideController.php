<?php
// app/Http/Controllers/Api/RideController.php
 
namespace App\Http\Controllers\Api;
 
use App\Http\Controllers\Controller;
use App\Http\Requests\{StartRideRequest, LocationRequest, FinishRideRequest};
use App\Http\Resources\{RideResource, RideDetailResource};
use App\Models\Ride;
use App\Services\RideService;
use Illuminate\Http\{JsonResponse, Request};
 
class RideController extends Controller
{
    public function __construct(private readonly RideService $rideService) {}
 
    /**
     * POST /api/rides/start
     */
    public function start(StartRideRequest $request): JsonResponse
    {
        $ride = $this->rideService->startRide(
            userId: $request->user()->id,
            mode: $request->input('mode', 'free')
        );
 
        return response()->json([
            'success' => true,
            'data'    => new RideResource($ride),
            'message' => 'Ride dimulai.',
        ], 201);
    }
 
    /**
     * POST /api/rides/location
     * Terima batch GPS dari frontend
     */
    public function location(LocationRequest $request): JsonResponse
    {
        $ride = Ride::where('user_id', $request->user()->id)
            ->where('status', 'active')
            ->latest()
            ->firstOrFail();
 
        $this->rideService->saveLocations($ride, $request->input('locations'));
 
        return response()->json(['success' => true, 'message' => 'Lokasi disimpan.']);
    }
 
    /**
     * POST /api/rides/{ride}/pause
     */
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

    /**
     * POST /api/rides/{ride}/resume
     */
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

    /**
     * POST /api/rides/{ride}/finish
     */
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
 
    /**
     * GET /api/rides/history
     */
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
 
    /**
     * GET /api/rides/{ride}
     */
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
}
