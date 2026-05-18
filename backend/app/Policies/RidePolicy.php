<?php

namespace App\Policies;
 
use App\Models\{Ride, User};
 
class RidePolicy
{
    public function update(User $user, Ride $ride): bool
    {
        return $user->id === $ride->user_id;
    }
}
