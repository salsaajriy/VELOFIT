<?php

namespace App\Services;
 
use App\Models\Ride;
use App\Models\RideLocation;
use App\Models\RideAlert;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
 
class RideService
{
    public function __construct(
        private readonly RideStatsService $statsService
    ) {}
 
    public function startRide(int $userId, string $mode = 'free', ?string $routeName = null): Ride
    {
        $activeRide = Ride::where('user_id', $userId)
            ->active()
            ->first();

        if ($activeRide) {
            throw new \Exception(
                'Still have an active ride.'
            );
        }

        $user = User::findOrFail($userId);

        if (!$user->weight) {
            throw ValidationException::withMessages([
                'weight' => [
                    'Please complete your weight information before starting an activity.'
                ]
            ]);
        }

        return Ride::create([
            'user_id'    => $userId,
            'mode'       => $mode,
            'status'     => 'active',
            'started_at' => now(),
            'route_name' => $routeName,
        ]);
    }
 
    public function saveLocations(Ride $ride, array $locations): void
    {
        if (empty($locations)) return;
 
        $records = array_map(fn($loc) => [
            'ride_id'     => $ride->id,
            'latitude'    => $loc['latitude'],
            'longitude'   => $loc['longitude'],
            'speed'       => $loc['speed'] ?? 0,
            'altitude'    => $loc['altitude'] ?? null,
            'accuracy'    => $loc['accuracy'] ?? null,
            'recorded_at' => $loc['recorded_at'] ?? now(),
            'created_at'  => now(),
            'updated_at'  => now(),
        ], $locations);
 
        RideLocation::insert($records);
 
        if (is_null($ride->start_lat) && !empty($records)) {
            $ride->update([
                'start_lat' => $records[0]['latitude'],
                'start_lng' => $records[0]['longitude'],
            ]);
        }
    }

    public function pauseRide(Ride $ride): Ride
    {
        $ride->update([
            'status'    => 'paused',
            'paused_at' => now(),
        ]);
        return $ride->fresh();
    }

    public function resumeRide(Ride $ride): Ride
    {
        $ride->update([
            'status'    => 'active',
            'paused_at' => null,
        ]);
        return $ride->fresh();
    }
 
    public function finishRide(Ride $ride, array $finalStats): Ride
    {
        $lastLocation = $ride->locations()->latest('recorded_at')->first();

        $ride->loadMissing('user');
        if (!$ride->user?->weight) {
            throw ValidationException::withMessages([
                'weight' => [
                    'User weight is required to calculate calories.'
                ]
            ]);
        }

        $userWeight = $ride->user->weight;

        $calories = $this->statsService->calculateCalories(
            durationSeconds: $finalStats['duration'],
            weightKg: $userWeight,
            avgSpeed: $finalStats['avg_speed']
        );

        $avgSpeed = $this->statsService->calculateAverageSpeed(
            distanceKm: $finalStats['distance'],
            durationSeconds: $finalStats['duration']
        );
        $ride->update([
            'status'     => 'completed',
            'ended_at'   => now(),
            'distance'   => $finalStats['distance'],
            'duration'   => $finalStats['duration'],
            'avg_speed'  => $avgSpeed,
            'max_speed'  => $finalStats['max_speed'],
            'end_lat'    => $lastLocation?->latitude,
            'end_lng'    => $lastLocation?->longitude,
            'calories'   => $calories,
        ]);
 
        return $ride->fresh(['locations', 'alerts']);
    }

    public function getUserHistory(int $userId, int $perPage = 10)
    {
        return Ride::where('user_id', $userId)
            ->where('status', 'completed')
            ->orderByDesc('started_at')
            ->paginate($perPage);
    }

    public function getRideDetail(int $rideId, int $userId): ?Ride
    {
        return Ride::where('id', $rideId)
            ->where('user_id', $userId)
            ->with(['locations', 'alerts'])
            ->first();
    }

    public function getStats(int $userId): array
    {
        $completedRides = Ride::query()
            ->where('user_id', $userId)
            ->where('status', 'completed');

        $totalDistance = (float) $completedRides->sum('distance');
        $totalDuration = (int) $completedRides->sum('duration');
        $totalCalories = (float) $completedRides->sum('calories');

        $totalRides = Ride::query()
            ->where('user_id', $userId)
            ->where('status', 'completed')
            ->count();

        $weeklyDistance = Ride::query()
            ->where('user_id', $userId)
            ->where('status', 'completed')
            ->whereBetween('started_at', [
                Carbon::now()->startOfWeek(),
                Carbon::now()->endOfWeek(),
            ])
            ->sum('distance');

        $monthlyDistance = Ride::query()
            ->where('user_id', $userId)
            ->where('status', 'completed')
            ->whereMonth('started_at', now()->month)
            ->whereYear('started_at', now()->year)
            ->sum('distance');

        return [
            'total_rides' => $totalRides,
            'total_distance' => round($totalDistance, 2),
            'total_duration' => $totalDuration,
            'total_calories' => round($totalCalories, 2),

            'weekly_distance' => round($weeklyDistance, 2),
            'monthly_distance' => round($monthlyDistance, 2),
        ];
    }
}
