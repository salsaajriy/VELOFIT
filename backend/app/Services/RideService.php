<?php

namespace App\Services;
 
use App\Models\Ride;
use App\Models\RideLocation;
use App\Models\RideAlert;
use App\Models\SensorReading;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;
 
class RideService
{
    public function haversineDistance(
        float $lat1, float $lon1,
        float $lat2, float $lon2
    ): float {
        $earthRadius = 6371.0;

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) ** 2
           + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon / 2) ** 2;

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    public function __construct(
        private readonly RideStatsService $statsService
    ) {}

    public function storeSensorPayload(Ride $ride, array $payload): void
    {
        $now = Carbon::now();

        // GPS only stored when signal is valid
        if ($payload['gpsOk'] && $payload['lat'] != 0.0 && $payload['lon'] != 0.0) {
            RideLocation::create([
                'ride_id'     => $ride->id,
                'latitude'    => $payload['lat'],
                'longitude'   => $payload['lon'],
                'recorded_at' => $now,
            ]);
        }

        SensorReading::create([
            'ride_id'          => $ride->id,
            'helmet_id'        => $payload['helmet_id'],
            'body_temperature' => $payload['body'],
            'room_temperature' => $payload['room'],
            'impact_g'         => $payload['g'],
            'alert_state'      => $payload['alert'],
            'recorded_at'      => $now,
        ]);
    }
 
    public function startRide(
        int $userId, 
        int $helmetId,
        ): Ride
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
            'helmet_id'  => $helmetId,
            'status'     => 'active',
            'start_time' => now(),
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
 
    public function finaliseRide(Ride $ride): Ride
    {
        $endTime = Carbon::now();
        
  
        $ride->loadMissing('user');
        
        if (!$ride->user || !$ride->user->weight) {
            throw ValidationException::withMessages([
                'weight' => [
                    'User weight is required to calculate calories. Please update your profile.'
                ]
            ]);
        }
        
        $userWeight = $ride->user->weight;
        
        // Calculate total distance from GPS locations
        $locations = $ride->locations()->orderBy('recorded_at')->get();
        $distance  = $this->calculateTotalDistance($locations); 

        $duration = $endTime->diffInSeconds($ride->start_time);
        
        $avgSpeed = $duration > 0 ? ($distance / ($duration / 3600)) : 0;
        
        $maxSpeed = $this->calculateMaxSpeed($locations);

        $calories = $this->statsService->calculateCalories(
            durationSeconds: $duration,
            weightKg: $userWeight,
            avgSpeed: $avgSpeed,
            distanceKm: $distance
        );
        
        $ride->update([
            'end_time'  => $endTime,
            'duration'  => $duration,
            'distance'  => round($distance, 4),
            'avg_speed' => round($avgSpeed, 2),
            'max_speed' => round($maxSpeed, 2),
            'calories'  => $calories,
            'status'    => 'completed',
        ]);
        
        return $ride->fresh();
    }


    public function getRideDetail(int $rideId, int $userId): ?Ride
    {
        return Ride::where('id', $rideId)
            ->where('user_id', $userId)
            ->with(['locations', 'alerts'])
            ->first();
    }

    public function deleteRide(int $rideId, int $userId): bool
    {
        $ride = Ride::where('id', $rideId)
            ->where('user_id', $userId)
            ->firstOrFail();

        return $ride->delete();
    }

    private function calculateTotalDistance(Collection $locations): float
    {
        $total = 0.0;
        $prev  = null;

        foreach ($locations as $loc) {
            if ($prev !== null) {
                $total += $this->haversineDistance(
                    $prev->latitude, $prev->longitude,
                    $loc->latitude,  $loc->longitude
                );
            }
            $prev = $loc;
        }

        return $total;
    }

    private function calculateMaxSpeed(Collection $locations): float
    {
        $max  = 0.0;
        $prev = null;

        foreach ($locations as $loc) {
            if ($prev !== null) {
                $dist = $this->haversineDistance(
                    $prev->latitude, $prev->longitude,
                    $loc->latitude,  $loc->longitude
                );
                // Time between readings in hours
                $timeDiff = abs(
                    $loc->recorded_at->diffInSeconds($prev->recorded_at)
                ) / 3600;

                if ($timeDiff > 0) {
                    $speed = $dist / $timeDiff;
                    if ($speed > $max) {
                        $max = $speed;
                    }
                }
            }
            $prev = $loc;
        }

        return $max;
    }

}
