<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;


class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'google_id',
        'avatar',
        'weight',
        'height',
        'birth_date',
        'gender',
        'contact1',
        'contact2',
        'name1',
        'name2',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'google_id',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'birth_date'        => 'date',
        ];
    }

    public function isAdmin(): bool {
        return $this->role === 'admin';
    }

    public function rides()
    {
        return $this->hasMany(Ride::class);
    }

    public function goals()
    {
        return $this->hasMany(Goal::class);
    }

    public function helmet()
    {
        return $this->hasMany(Helmet::class);
    }
}