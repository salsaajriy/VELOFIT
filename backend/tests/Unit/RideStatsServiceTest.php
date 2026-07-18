<?php

namespace Tests\Unit;

use App\Services\RideStatsService;
use PHPUnit\Framework\TestCase;

class RideStatsServiceTest extends TestCase
{
    public function test_calculate_calories_returns_positive_value()
    {
        $service = new RideStatsService();

        $calories = $service->calculateCalories(
            durationSeconds: 1800,
            weightKg: 60,
            avgSpeed: 20,
            distanceKm: 10
        );

        $this->assertGreaterThan(0, $calories);
    }
}