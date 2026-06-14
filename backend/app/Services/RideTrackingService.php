<?php

namespace App\Services;

use App\Models\Ride;
use App\Models\RideLocation;
use App\Models\SensorReading;
use App\Models\Helmet;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RideTrackingService
{
    /**
     * Store sensor data from ESP32
     */
    public function storeSensorData(Ride $ride, Helmet $helmet, array $data): void
    {
        DB::transaction(function () use ($ride, $helmet, $data) {
            $recordedAt = now();

            // Store GPS location if valid
            if (isset($data['latitude']) && isset($data['longitude'])) {
                RideLocation::create([
                    'ride_id' => $ride->id,
                    'latitude' => $data['latitude'],
                    'longitude' => $data['longitude'],
                    'speed' => $data['speed'] ?? null,
                    'gps_valid' => $data['gps_valid'] ?? true,
                    'recorded_at' => $recordedAt,
                ]);
            }

            // Store sensor readings
            SensorReading::create([
                'ride_id' => $ride->id,
                'helmet_id' => $helmet->id,
                'body_temperature' => $data['body_temperature'] ?? null,
                'room_temperature' => $data['room_temperature'] ?? null,
                'impact_g' => $data['impact_g'] ?? null,
                'gyro' => $data['gyro'] ?? null,
                'battery_level' => $data['battery_level'] ?? null,
                'alert_state' => $data['alert_state'] ?? 0,
                'recorded_at' => $recordedAt,
            ]);

            // Update real-time stats in ride (optional, for caching)
            $this->updateRideStatsCache($ride, $data);
        });
    }

    /**
     * Calculate and update ride statistics cache
     */
    private function updateRideStatsCache(Ride $ride, array $data): void
    {
        // Update max speed
        if (isset($data['speed']) && $data['speed'] > ($ride->max_speed ?? 0)) {
            $ride->update(['max_speed' => $data['speed']]);
        }
    }

    /**
     * Complete ride and calculate final statistics
     */
    public function completeRide(Ride $ride): array
    {
        $stats = $this->calculateRideStats($ride);
        
        $ride->complete($stats);
        
        return $stats;
    }

    /**
     * Calculate final ride statistics from stored data
     */
    private function calculateRideStats(Ride $ride): array
    {
        // Get all locations ordered by time
        $locations = $ride->locations()->orderBy('recorded_at')->get();
        
        $totalDistance = 0;
        $maxSpeed = 0;
        $speedSum = 0;
        $speedCount = 0;
        
        // Calculate distance between consecutive points (Haversine formula)
        for ($i = 1; $i < $locations->count(); $i++) {
            $prev = $locations[$i - 1];
            $curr = $locations[$i];
            
            $distance = $this->haversineDistance(
                $prev->latitude, $prev->longitude,
                $curr->latitude, $curr->longitude
            );
            
            $totalDistance += $distance;
            
            if ($curr->speed && $curr->speed > $maxSpeed) {
                $maxSpeed = $curr->speed;
            }
            
            if ($curr->speed) {
                $speedSum += $curr->speed;
                $speedCount++;
            }
        }
        
        $averageSpeed = $speedCount > 0 ? $speedSum / $speedCount : 0;
        
        // Calculate duration
        $duration = $ride->start_time->diffInSeconds($ride->end_time ?? now());
        
        // Calculate calories (simplified formula)
        // Calories = duration (min) * 8.5 * (speed_kmh / 20)
        $calories = $duration > 0 && $averageSpeed > 0 
            ? round(($duration / 60) * 8.5 * ($averageSpeed / 20))
            : 0;
        
        return [
            'duration' => $duration,
            'distance' => $totalDistance,
            'average_speed' => round($averageSpeed, 2),
            'max_speed' => round($maxSpeed, 2),
            'calories' => $calories,
        ];
    }

    /**
     * Calculate distance between two points using Haversine formula
     */
    private function haversineDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371000; // meters
        
        $latDelta = deg2rad($lat2 - $lat1);
        $lonDelta = deg2rad($lon2 - $lon1);
        
        $a = sin($latDelta / 2) * sin($latDelta / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($lonDelta / 2) * sin($lonDelta / 2);
        
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        
        return $earthRadius * $c;
    }

    /**
     * Get ride telemetry for active ride
     */
    public function getActiveRideTelemetry(Ride $ride): array
    {
        $latestLocation = $ride->locations()->latest('recorded_at')->first();
        $latestSensor = $ride->sensorReadings()->latest('recorded_at')->first();
        
        return [
            'current_location' => $latestLocation ? [
                'lat' => $latestLocation->latitude,
                'lng' => $latestLocation->longitude,
                'speed' => $latestLocation->speed,
            ] : null,
            'current_sensors' => $latestSensor ? [
                'body_temperature' => $latestSensor->body_temperature,
                'room_temperature' => $latestSensor->room_temperature,
                'impact_g' => $latestSensor->impact_g,
                'battery_level' => $latestSensor->battery_level,
                'alert_state' => $latestSensor->alert_state,
            ] : null,
            'stats' => [
                'distance' => $this->calculateCurrentDistance($ride),
                'duration' => $ride->start_time->diffInSeconds(now()),
                'max_speed' => $ride->max_speed ?? 0,
            ],
        ];
    }

    /**
     * Calculate current distance traveled
     */
    private function calculateCurrentDistance(Ride $ride): float
    {
        $locations = $ride->locations()->orderBy('recorded_at')->get();
        $distance = 0;
        
        for ($i = 1; $i < $locations->count(); $i++) {
            $prev = $locations[$i - 1];
            $curr = $locations[$i];
            
            $distance += $this->haversineDistance(
                $prev->latitude, $prev->longitude,
                $curr->latitude, $curr->longitude
            );
        }
        
        return $distance;
    }
}