<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RideResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'helmet_id'  => $this->helmet_id,
            'helmet'     => new HelmetResource($this->whenLoaded('helmet')),
            'start_time' => $this->start_time->toISOString(),
            'end_time'   => $this->end_time?->toISOString(),
            'duration'   => $this->duration,
            'distance'   => $this->distance,
            'avg_speed'  => $this->avg_speed,
            'max_speed'  => $this->max_speed,
            'calories'   => $this->calories,
            'status'     => $this->status,
            'created_at' => $this->created_at->toISOString(),
        ];
    }
}