<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ride extends Model
{
    protected $fillable = [
        'user_id',
        'helmet_id',
        'start_time',
        'end_time',
        'duration',
        'distance',
        'avg_speed',
        'max_speed',
        'calories',
        'status',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time'   => 'datetime',
        'distance'   => 'float',
        'avg_speed'  => 'float',
        'max_speed'  => 'float',
        'calories'   => 'float',
        'duration'   => 'float',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function helmet(): BelongsTo
    {
        return $this->belongsTo(Helmet::class);
    }

    public function locations(): HasMany
    {
        return $this->hasMany(RideLocation::class)->orderBy('recorded_at');
    }

    public function sensorReadings(): HasMany
    {
        return $this->hasMany(SensorReading::class)->orderBy('recorded_at');
    }
}