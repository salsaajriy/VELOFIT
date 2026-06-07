<?php

namespace App\Models;
 
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
 
class Ride extends Model
{
    protected $fillable = [
        'user_id',
        'mode',
        'distance',
        'duration',
        'avg_speed',
        'max_speed',
        'calories',
        'status',
        'start_lat',
        'start_lng',
        'end_lat',
        'end_lng',
        'started_at',
        'paused_at',
        'ended_at',
    ];
 
    protected $casts = [
        'distance'   => 'float',
        'duration'   => 'integer',
        'avg_speed'  => 'float',
        'max_speed'  => 'float',
        'calories'   => 'float',
        'start_lat'  => 'float',
        'start_lng'  => 'float',
        'end_lat'    => 'float',
        'end_lng'    => 'float',
        'started_at' => 'datetime',
        'paused_at'  => 'datetime',
        'ended_at'   => 'datetime',
    ];
 
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
 
    public function locations(): HasMany
    {
        return $this->hasMany(RideLocation::class)->orderBy('recorded_at');
    }
 
    public function alerts(): HasMany
    {
        return $this->hasMany(RideAlert::class)->latest();
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->whereIn('status', [
            'active',
            'paused'
        ]);
    }
}
