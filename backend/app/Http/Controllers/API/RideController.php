<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Ride;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class RideController extends Controller
{
    public function startRide(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $ride = Ride::create([
            'user_id'    => Auth::id(),
            'name'       => $request->input('name', 'Untitled Ride'),
            'start_time' => now(),
            'status'     => 'active',
        ]);

        return response()->json([
            'message' => 'Ride started.',
            'ride_id' => $ride->id,
            'started_at' => $ride->start_time->toISOString(),
        ], 201);
    }

    public function finishRide(Request $request, int $id): JsonResponse
    {
        $ride = Ride::where('id', $id)
                    ->where('user_id', Auth::id())
                    ->where('status', 'active')
                    ->first();

        if (!$ride) {
            return response()->json([
                'message' => 'Active ride not found or does not belong to you.',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'distance'  => 'required|numeric|min:0',
            'duration'  => 'required|integer|min:1',   // seconds
            'calories'  => 'required|integer|min:0',
            'route'     => 'required|array|min:1',
            'route.*.lat' => 'required|numeric|between:-90,90',
            'route.*.lng' => 'required|numeric|between:-180,180',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $distance = (float) $request->input('distance');
        $duration = (int)   $request->input('duration');   // seconds
        $calories = (int)   $request->input('calories');
        $route    = $request->input('route');

        // avg_speed = distance / (duration in hours)
        $avgSpeed = $duration > 0
            ? round(($distance / ($duration / 3600)), 2)
            : 0;

        // A ride is "completed" if distance >= 0.5 km, else "incomplete"
        $status = $distance >= 0.5 ? 'completed' : 'incomplete';

        $ride->update([
            'end_time'  => now(),
            'duration'  => $duration,
            'distance'  => $distance,
            'avg_speed' => $avgSpeed,
            'calories'  => $calories,
            'route'     => $route,
            'status'    => $status,
        ]);

        return response()->json([
            'message'  => 'Ride finished.',
            'ride'     => $this->formatRide($ride->fresh()),
        ]);
    }

    public function history(Request $request): JsonResponse
    {
        $rides = Ride::where('user_id', Auth::id())
                     ->whereIn('status', ['completed', 'incomplete'])
                     ->orderBy('created_at', 'desc')
                     ->get();

        return response()->json([
            'rides' => $rides->map(fn (Ride $r) => $this->formatRide($r)),
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $ride = Ride::where('id', $id)
                    ->where('user_id', Auth::id())
                    ->first();

        if (!$ride) {
            return response()->json(['message' => 'Ride not found.'], 404);
        }

        return response()->json([
            'ride' => $this->formatRide($ride),
        ]);
    }

    // ── Private helpers ────────────────────────────────────────────────────

    /**
     * Map a Ride model to the shape expected by the frontend.
     *
     * routeCoords is an array of [lat, lng] tuples (not objects),
     * which is what Leaflet / the history UI expects.
     */
    private function formatRide(Ride $ride): array
    {
        return [
            'id'          => (string) $ride->id,
            'name'        => $ride->name,
            'date'        => $ride->start_time
                                ? $ride->start_time->format('M d, Y') . ' • ' . $ride->start_time->format('h:i A')
                                : '—',
            'start_time'  => $ride->start_time?->toISOString(),
            'end_time'    => $ride->end_time?->toISOString(),
            'distance'    => $ride->formatted_distance,     // "42.5 km"
            'duration'    => $ride->formatted_duration,     // "1h 45m"
            'duration_s'  => $ride->duration,               // raw seconds
            'status'      => $ride->frontend_status,        // "Completed" | "Incompleted"
            'avgSpeed'    => (float) ($ride->avg_speed ?? 0),
            'calories'    => $ride->calories ?? 0,
            // Convert [{lat, lng}] → [[lat, lng]] for Leaflet
            'routeCoords' => collect($ride->route ?? [])
                                ->map(fn ($p) => [(float) $p['lat'], (float) $p['lng']])
                                ->values()
                                ->all(),
        ];
    }
}