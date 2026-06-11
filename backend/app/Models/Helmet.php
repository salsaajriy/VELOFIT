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
        'device_name',
        'battery',
        'is_active',
        'last_ping',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'battery'   => 'integer',
        'last_ping' => 'datetime',
    ];

    protected function getStatusAttribute(): string
    {
        if (!$this->is_active) {
            return 'inactive';
        }
        
        if ($this->last_ping && $this->last_ping->diffInMinutes(now()) > 10) {
            return 'offline';
        }
        
        if ($this->battery < 20) {
            return 'low_battery';
        }
        
        return 'online';
    }

    protected $appends = ['status'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}