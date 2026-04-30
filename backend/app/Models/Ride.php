<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Ride extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'start_time',
        'end_time',
        'duration',
        'distance',
        'avg_speed',
        'calories',
        'route',
        'status',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time'   => 'datetime',
        'route'      => 'array',
        'distance'   => 'float',
        'avg_speed'  => 'float',
        'duration'   => 'integer',
        'calories'   => 'integer',
    ];


    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ── Computed / Helper ──────────────────────────────────────────────────

    /**
     * Formatted duration: "1h 45m" or "28m"
     */
    public function getFormattedDurationAttribute(): string
    {
        if (!$this->duration) return '—';

        $hours   = intdiv($this->duration, 3600);
        $minutes = intdiv($this->duration % 3600, 60);

        if ($hours > 0) {
            return "{$hours}h {$minutes}m";
        }

        return "{$minutes}m";
    }

    /**
     * Formatted distance: "42.5 km"
     */
    public function getFormattedDistanceAttribute(): string
    {
        if ($this->distance === null) return '—';
        return number_format($this->distance, 1) . ' km';
    }

    /**
     * Frontend-friendly status: 'Completed' | 'Incompleted'
     */
    public function getFrontendStatusAttribute(): string
    {
        return match ($this->status) {
            'completed' => 'Completed',
            default     => 'Incompleted',
        };
    }
}