<?php

namespace App\Models;
 
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
 
class RideAlert extends Model
{
    protected $fillable = [
        'ride_id', 'type', 'message', 'metadata', 'acknowledged',
    ];
 
    protected $casts = [
        'metadata'     => 'array',
        'acknowledged' => 'boolean',
    ];
 
    public function ride(): BelongsTo
    {
        return $this->belongsTo(Ride::class);
    }
}
