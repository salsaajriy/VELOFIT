<?php

namespace App\Services\Goals;

use App\Models\Goal;
use App\Models\Ride;
use App\Models\User;
use Carbon\Carbon;

class GoalProgressService
{
    public function getUserProgress(User $user): array
    {
        $goals = Goal::query()
            ->where('user_id', $user->id)
            ->where('is_active', true)
            ->get();

        $result = [];

        foreach ($goals as $goal) {

            $currentValue = $this->calculateProgress(
                user: $user,
                metric: $goal->metric_type,
                period: $goal->period,
            );

            $percentage = $goal->target_value > 0
                ? round(($currentValue / $goal->target_value) * 100)
                : 0;

            $percentage = min($percentage, 100);

            $result[] = [
                'id' => $goal->id,
                'metric_type' => $goal->metric_type,
                'period' => $goal->period,
                'target_value' => $goal->target_value,
                'current_value' => round($currentValue, 2),
                'percentage' => $percentage,
                'is_completed' => $percentage >= 100,
            ];
        }

        return $result;
    }

    private function calculateProgress(
        User $user,
        string $metric,
        string $period,
    ): float {

        $query = Ride::query()
            ->where('user_id', $user->id)
            ->where('status', 'completed');

        if ($period === 'daily') {

            $query->whereDate(
                'started_at',
                Carbon::today()
            );

        } else {

            $query->whereBetween('started_at', [
                Carbon::now()->startOfWeek(),
                Carbon::now()->endOfWeek(),
            ]);
        }

        return match ($metric) {

            'distance' => (float) $query->sum('distance'),
            'calories' => (float) $query->sum('calories'),
            'duration' => (float) $query->sum('duration'),
            'rides' => (float) $query->count(),
            default => 0,
        };
    }
}