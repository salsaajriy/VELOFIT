<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class RideDetailResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            ...(new RideResource($this->resource))
                ->toArray($request),

            'locations' => $this->locations->map(
                fn ($loc) => [
                    'id' => $loc->id,
                    'lat' => $loc->latitude,
                    'lng' => $loc->longitude,
                    'speed' => $loc->speed,
                    'altitude' => $loc->altitude,
                    'accuracy' => $loc->accuracy,
                    'recorded_at' => $loc->recorded_at?->toISOString(),
                ]
            ),

            'alerts' => $this->alerts->map(
                fn ($alert) => [
                    'id' => $alert->id,
                    'type' => $alert->type,
                    'message' => $alert->message,
                    'acknowledged' => $alert->acknowledged,
                    'created_at' => $alert->created_at?->toISOString(),
                ]
            ),
        ];
    }
}