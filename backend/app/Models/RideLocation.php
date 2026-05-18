<?php

namespace App\Models;
 
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
 
class RideLocation extends Model
{
    protected $fillable = [
        'ride_id', 'latitude', 'longitude',
        'speed', 'altitude', 'recorded_at',
    ];
 
    protected $casts = [
        'latitude'    => 'float',
        'longitude'   => 'float',
        'speed'       => 'float',
        'altitude'    => 'float',
        'recorded_at' => 'datetime',
    ];
 
    public function ride(): BelongsTo
    {
        return $this->belongsTo(Ride::class);
    }
}
