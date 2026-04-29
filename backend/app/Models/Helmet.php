<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Carbon\Carbon;

class Helmet extends Model
{
    protected $fillable = [
        'user_id',
        'device_id',
        'name',
        'battery',
        'connection',
        'is_active',
        'last_seen',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'battery'   => 'integer',
        'last_seen' => 'datetime',
    ];

    // Accessor: auto-compute connection status based on last_seen
    protected function connection(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                if (!$this->last_seen) return 'offline';
                return $this->last_seen->diffInSeconds(now()) <= 10
                    ? 'connected'
                    : 'offline';
            }
        );
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}