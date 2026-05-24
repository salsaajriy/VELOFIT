<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RideStatsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'total_rides' => $this['total_rides'],
            'total_distance' => $this['total_distance'],
            'total_duration' => $this['total_duration'],
            'total_calories' => $this['total_calories'],

            'weekly_distance' => $this['weekly_distance'],
            'monthly_distance' => $this['monthly_distance'],
        ];
    }
}