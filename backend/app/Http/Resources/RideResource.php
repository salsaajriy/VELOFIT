<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class RideResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'mode' => $this->mode,
            'navigation_result' => $this->navigation_result,
            'route_name' => $this->route_name,
            'status' => $this->status,
            'distance' => round($this->distance, 3),
            'duration' => $this->duration,
            'avg_speed' => round($this->avg_speed, 2),
            'max_speed' => round($this->max_speed, 2),
            'calories' => round($this->calories, 1),
            'destination_lat' => $this->destination_lat,
            'destination_lng' => $this->destination_lng,
            'start_lat' => $this->start_lat,
            'start_lng' => $this->start_lng,
            'end_lat' => $this->end_lat,
            'end_lng' => $this->end_lng,
            'source' => $this->source,
            'completed_reason' => $this->completed_reason,
            'started_at' => $this->started_at?->toISOString(),
            'ended_at' => $this->ended_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}