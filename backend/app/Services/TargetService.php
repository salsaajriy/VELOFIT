<?php

namespace App\Services;

use App\Models\Ride;
use App\Models\Target;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class TargetService
{
    /**
     * Get the user's currently active target of a given type.
     */
    public function getActive(int $userId, string $type): ?Target
    {
        return Target::where('user_id', $userId)
                     ->where('type', $type)
                     ->where('is_active', true)
                     ->first();
    }

    /**
     * Create a new active target. If a target of the SAME type is already
     * active, it is closed (becomes a history row) before creating the new one.
     * Switching types (daily <-> weekly) does not close the other type — each
     * type tracks its own independent active target and history.
     */
    public function setTarget(int $userId, string $type, float $distance): Target
    {
        $existing = $this->getActive($userId, $type);

        if ($existing) {
            $existing->update([
                'is_active' => false,
                'end_date'  => Carbon::today()->toDateString(),
            ]);
        }

        return Target::create([
            'user_id'    => $userId,
            'type'       => $type,
            'distance'   => $distance,
            'start_date' => Carbon::today()->toDateString(),
            'end_date'   => null,
            'is_active'  => true,
        ]);
    }

    /**
     * All closed (inactive) targets, most recent first — this is the History list.
     */
    public function getHistory(int $userId): Collection
    {
        return Target::where('user_id', $userId)
                     ->where('is_active', false)
                     ->orderByDesc('start_date')
                     ->get();
    }

    /**
     * Total distance ridden by the user on a single calendar day.
     * Sums distance from completed rides only.
     */
    public function distanceForDate(int $userId, string $date): float
    {
        return (float) Ride::where('user_id', $userId)
                           ->where('status', 'completed')
                           ->whereDate('end_time', $date)
                           ->sum('distance');
    }

    /**
     * Total distance ridden by the user within a date range (inclusive).
     */
    public function distanceForRange(int $userId, string $startDate, string $endDate): float
    {
        return (float) Ride::where('user_id', $userId)
                           ->where('status', 'completed')
                           ->whereDate('end_time', '>=', $startDate)
                           ->whereDate('end_time', '<=', $endDate)
                           ->sum('distance');
    }

    /**
     * Per-day distance breakdown for the last N days (used for daily chart / streak).
     * Returns array of ['date' => 'Y-m-d', 'distance' => float] for every day,
     * including days with zero rides.
     */
    public function dailyBreakdown(int $userId, int $days = 30): array
    {
        $start = Carbon::today()->subDays($days - 1);
        $end   = Carbon::today();

        $rides = Ride::where('user_id', $userId)
                     ->where('status', 'completed')
                     ->whereDate('end_time', '>=', $start)
                     ->whereDate('end_time', '<=', $end)
                     ->get(['distance', 'end_time']);

        $byDate = [];
        foreach ($rides as $ride) {
            $d = Carbon::parse($ride->end_time)->toDateString();
            $byDate[$d] = ($byDate[$d] ?? 0) + (float) $ride->distance;
        }

        $result = [];
        for ($i = 0; $i < $days; $i++) {
            $date = $start->copy()->addDays($i)->toDateString();
            $result[] = [
                'date'     => $date,
                'distance' => round($byDate[$date] ?? 0, 2),
            ];
        }

        return $result;
    }

    /**
     * Per-week distance totals for the last N weeks (Mon–Sun), most recent last.
     * Each week also carries the weekly target that was active during that week,
     * looked up from history + current active target.
     */
    public function weeklyBreakdown(int $userId, int $weeks = 6): array
    {
        $weekTargets = Target::where('user_id', $userId)
                             ->where('type', 'weekly')
                             ->orderBy('start_date')
                             ->get(['distance', 'start_date', 'end_date']);

        $result = [];
        $today  = Carbon::today();

        for ($i = $weeks - 1; $i >= 0; $i--) {
            $weekStart = $today->copy()->subWeeks($i)->startOfWeek(Carbon::MONDAY);
            $weekEnd   = $weekStart->copy()->endOfWeek(Carbon::SUNDAY);

            $total = $this->distanceForRange($userId, $weekStart->toDateString(), $weekEnd->toDateString());

            // Find the weekly target whose range covers this week's start date
            $targetForWeek = $weekTargets->first(function ($t) use ($weekStart) {
                $start = Carbon::parse($t->start_date);
                $end   = $t->end_date ? Carbon::parse($t->end_date) : Carbon::today();
                return $weekStart->between($start, $end);
            });

            $result[] = [
                'week_start' => $weekStart->toDateString(),
                'week_end'   => $weekEnd->toDateString(),
                'total'      => round($total, 2),
                'target'     => $targetForWeek ? (float) $targetForWeek->distance : null,
            ];
        }

        return $result;
    }

    /**
     * Number of days in the last $window days where distance >= the given daily target.
     */
    public function streak(int $userId, float $dailyTarget, int $window = 30): int
    {
        $breakdown = $this->dailyBreakdown($userId, $window);

        return count(array_filter($breakdown, fn ($d) => $d['distance'] >= $dailyTarget));
    }

    /**
     * Best single day in the last $window days.
     */
    public function bestDay(int $userId, int $window = 30): ?array
    {
        $breakdown = $this->dailyBreakdown($userId, $window);

        if (empty($breakdown)) {
            return null;
        }

        usort($breakdown, fn ($a, $b) => $b['distance'] <=> $a['distance']);

        return $breakdown[0];
    }

    public function computeProgress(int $userId, Target $target): array
    {
        if ($target->type === 'daily') {
            $current = $this->distanceForDate($userId, Carbon::today()->toDateString());
        } else {
            $weekStart = Carbon::today()->startOfWeek(Carbon::MONDAY);
            $weekEnd   = Carbon::today()->endOfWeek(Carbon::SUNDAY);
            $current   = $this->distanceForRange(
                $userId, 
                $weekStart->toDateString(), 
                $weekEnd->toDateString()
            );
        }

        $current = round($current, 2);
        $percent = $target->distance > 0
            ? min(100, round(($current / $target->distance) * 100))
            : 0;

        return [
            'current'   => $current,
            'remaining' => max(0, round($target->distance - $current, 2)),
            'percent'   => $percent,
        ];
    }

    public function getActiveWithProgress(int $userId, string $type): ?array
    {
        $target = $this->getActive($userId, $type);
        
        if (!$target) {
            return null;
        }

        $progress = $this->computeProgress($userId, $target);

        return [
            'target' => $target,
            'progress' => $progress,
        ];
    }
}