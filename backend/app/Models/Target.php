<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Target extends Model
{
    protected $table = 'targets';
    
    protected $fillable = [
        'user_id',
        'type',
        'distance',
        'start_date',
        'end_date',
        'is_active',
    ];

    protected $casts = [
        'distance'   => 'float',
        'start_date' => 'date',
        'end_date'   => 'date',
        'is_active'  => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}