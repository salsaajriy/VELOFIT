<?php

namespace App\Services;
 
class RideStatsService
{
    // MET value untuk bersepeda sedang (16-19 km/h)
    private const MET_CYCLING = 8.0;
    private const TEMP_THRESHOLD = 38.0; // Celsius
    private const IMPACT_G_THRESHOLD = 4.0; // G-force
 
    /**
     * Hitung kalori dengan formula MET
     * Kalori = MET x Berat Badan (kg) x Durasi (jam)
     */
    public function calculateCalories(
        float $durationSeconds,
        float $weightKg = 70.0
    ): float {
        $durationHours = $durationSeconds / 3600;
        return round(self::MET_CYCLING * $weightKg * $durationHours, 2);
    }
 
    /**
     * Tentukan alert berdasarkan data IoT
     */
    public function checkAlerts(array $iotData): ?array
    {
        $bodyTemp = $iotData['body_temperature'] ?? null;
        $impact   = $iotData['impact_detected'] ?? false;
 
        if ($impact) {
            return [
                'type'    => 'impact',
                'message' => 'Benturan keras terdeteksi! Periksa kondisi pengendara.',
                'metadata' => $iotData,
            ];
        }
 
        if ($bodyTemp && $bodyTemp > self::TEMP_THRESHOLD) {
            return [
                'type'    => 'temperature',
                'message' => "Suhu tubuh tinggi: {$bodyTemp}°C. Istirahat dan minum air.",
                'metadata' => ['body_temperature' => $bodyTemp],
            ];
        }
 
        return null;
    }
}
