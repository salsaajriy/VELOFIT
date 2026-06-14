<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SensorReading extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'ride_id',
        'helmet_id',
        'body_temperature',
        'room_temperature',
        'impact_g',
        'alert_state',
        'recorded_at',
    ];

    protected $casts = [
        'body_temperature' => 'float',
        'room_temperature' => 'float',
        'impact_g'         => 'float',
        'alert_state'      => 'integer',
        'recorded_at'      => 'datetime',
    ];

    public function ride(): BelongsTo
    {
        return $this->belongsTo(Ride::class);
    }

    public function helmet(): BelongsTo
    {
        return $this->belongsTo(Helmet::class);
    }
}