<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RideDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'helmet'     => new HelmetResource($this->whenLoaded('helmet')),
            'start_time' => $this->start_time->toISOString(),
            'end_time'   => $this->end_time?->toISOString(),
            'duration'   => $this->duration,
            'distance'   => $this->distance,
            'avg_speed'  => $this->avg_speed,
            'max_speed'  => $this->max_speed,
            'calories'   => $this->calories,
            'status'     => $this->status,
            'route'      => $this->whenLoaded('locations', fn () =>
                $this->locations->map(fn ($l) => [
                    'lat'         => $l->latitude,
                    'lng'         => $l->longitude,
                    'recorded_at' => $l->recorded_at->toISOString(),
                ])
            ),
            'sensor_readings' => $this->whenLoaded('sensorReadings', fn () =>
                $this->sensorReadings->map(fn ($s) => [
                    'body_temperature' => $s->body_temperature,
                    'room_temperature' => $s->room_temperature,
                    'impact_g'         => $s->impact_g,
                    'alert_state'      => $s->alert_state,
                    'recorded_at'      => $s->recorded_at->toISOString(),
                ])
            ),
        ];
    }
}