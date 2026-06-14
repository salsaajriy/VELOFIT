<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Helmet extends Model
{
    protected $fillable = [
        'user_id',
        'helmet_name',
        'bluetooth_device_name',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function rides(): HasMany
    {
        return $this->hasMany(Ride::class);
    }

    public function sensorReadings(): HasMany
    {
        return $this->hasMany(SensorReading::class)->orderBy('recorded_at');
    }
}