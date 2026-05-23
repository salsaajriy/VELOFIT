<?php

namespace App\Services;

class RideStatsService
{
    private const TEMP_THRESHOLD = 38.0;
    private const IMPACT_G_THRESHOLD = 4.0;

    private function getMetBySpeed(float $avgSpeed): float
    {
        return match (true) {
            $avgSpeed < 16 => 4.0,
            $avgSpeed < 19 => 6.8,
            $avgSpeed < 22 => 8.0,
            $avgSpeed < 25 => 10.0,
            default => 12.0,
        };
    }

    public function calculateCalories(
        float $durationSeconds,
        float $weightKg,
        float $avgSpeed
    ): float {
        $met = $this->getMetBySpeed($avgSpeed);

        $hours = $durationSeconds / 3600;

        return round(
            $met * $weightKg * $hours,
            2
        );
    }

    public function calculateAverageSpeed(
        float $distanceKm,
        int $durationSeconds
    ): float {
        if ($durationSeconds <= 0) {
            return 0;
        }

        return round(
            $distanceKm / ($durationSeconds / 3600),
            2
        );
    }

    public function checkAlerts(array $iotData): ?array
    {
        $bodyTemp = $iotData['body_temperature'] ?? null;
        $impactG  = $iotData['impact_g'] ?? 0;

        if ($impactG >= self::IMPACT_G_THRESHOLD) {
            return [
                'type' => 'impact',
                'message' => 'Benturan keras terdeteksi!',
                'metadata' => [
                    'impact_g' => $impactG,
                ],
            ];
        }

        if (
            $bodyTemp !== null &&
            $bodyTemp > self::TEMP_THRESHOLD
        ) {
            return [
                'type' => 'temperature',
                'message' => "Suhu tubuh tinggi: {$bodyTemp}°C",
                'metadata' => [
                    'body_temperature' => $bodyTemp,
                ],
            ];
        }

        return null;
    }
}