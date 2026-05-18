<?php

namespace App\Http\Resources;
use Illuminate\Http\Resources\Json\JsonResource;
 
class RideResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'         => $this->id,
            'mode'       => $this->mode,
            'status'     => $this->status,
            'distance'   => round($this->distance, 3),
            'duration'   => $this->duration,
            'avg_speed'  => round($this->avg_speed, 2),
            'max_speed'  => round($this->max_speed, 2),
            'calories'   => round($this->calories, 1),
            'start_lat'  => $this->start_lat,
            'start_lng'  => $this->start_lng,
            'started_at' => $this->started_at?->toISOString(),
            'ended_at'   => $this->ended_at?->toISOString(),
        ];
    }
}