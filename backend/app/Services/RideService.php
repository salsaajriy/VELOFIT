<?php

namespace App\Services;
 
use App\Models\Ride;
use App\Models\RideLocation;
use App\Models\RideAlert;
use Illuminate\Support\Facades\DB;
 
class RideService
{
    public function __construct(
        private readonly RideStatsService $statsService
    ) {}
 
    /**
     * Mulai ride baru
     */
    public function startRide(int $userId, string $mode = 'free'): Ride
    {
        // Batalkan ride sebelumnya yang masih active/paused
        Ride::where('user_id', $userId)
            ->whereIn('status', ['active', 'paused'])
            ->update(['status' => 'abandoned']);
 
        return Ride::create([
            'user_id'    => $userId,
            'mode'       => $mode,
            'status'     => 'active',
            'started_at' => now(),
        ]);
    }
 
    /**
     * Simpan batch koordinat GPS
     */
    public function saveLocations(Ride $ride, array $locations): void
    {
        if (empty($locations)) return;
 
        $records = array_map(fn($loc) => [
            'ride_id'     => $ride->id,
            'latitude'    => $loc['latitude'],
            'longitude'   => $loc['longitude'],
            'speed'       => $loc['speed'] ?? 0,
            'altitude'    => $loc['altitude'] ?? null,
            'recorded_at' => $loc['recorded_at'] ?? now(),
            'created_at'  => now(),
            'updated_at'  => now(),
        ], $locations);
 
        RideLocation::insert($records);
 
        // Update start_lat/lng jika belum ada
        if (!$ride->start_lat && count($records) > 0) {
            $ride->update([
                'start_lat' => $records[0]['latitude'],
                'start_lng' => $records[0]['longitude'],
            ]);
        }
    }
 
    /**
     * Pause ride
     */
    public function pauseRide(Ride $ride): Ride
    {
        $ride->update([
            'status'    => 'paused',
            'paused_at' => now(),
        ]);
        return $ride->fresh();
    }
 
    /**
     * Resume ride
     */
    public function resumeRide(Ride $ride): Ride
    {
        $ride->update([
            'status'    => 'active',
            'paused_at' => null,
        ]);
        return $ride->fresh();
    }
 
    /**
     * Selesaikan ride & hitung statistik akhir
     */
    public function finishRide(Ride $ride, array $finalStats): Ride
    {
        $lastLocation = $ride->locations()->latest('recorded_at')->first();
 
        $ride->update([
            'status'     => 'completed',
            'ended_at'   => now(),
            'distance'   => $finalStats['distance'],
            'duration'   => $finalStats['duration'],
            'avg_speed'  => $finalStats['avg_speed'],
            'max_speed'  => $finalStats['max_speed'],
            'calories'   => $finalStats['calories'],
            'end_lat'    => $lastLocation?->latitude,
            'end_lng'    => $lastLocation?->longitude,
        ]);
 
        return $ride->fresh(['locations', 'alerts']);
    }
 
    /**
     * Ambil history ride user (paginated)
     */
    public function getUserHistory(int $userId, int $perPage = 10)
    {
        return Ride::where('user_id', $userId)
            ->where('status', 'completed')
            ->orderByDesc('started_at')
            ->paginate($perPage);
    }
 
    /**
     * Ambil detail ride beserta lokasi
     */
    public function getRideDetail(int $rideId, int $userId): ?Ride
    {
        return Ride::where('id', $rideId)
            ->where('user_id', $userId)
            ->with(['locations', 'alerts'])
            ->first();
    }
}
