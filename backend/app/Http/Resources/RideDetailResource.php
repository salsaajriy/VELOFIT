<?php

namespace App\Http\Resources;
use Illuminate\Http\Resources\Json\JsonResource;
 
class RideDetailResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            ...(new RideResource($this->resource))->toArray($request),
            'end_lat'   => $this->end_lat,
            'end_lng'   => $this->end_lng,
            'locations' => $this->locations->map(fn($loc) => [
                'lat'         => $loc->latitude,
                'lng'         => $loc->longitude,
                'speed'       => $loc->speed,
                'recorded_at' => $loc->recorded_at?->toISOString(),
            ]),
            'alerts' => $this->alerts->map(fn($alert) => [
                'id'      => $alert->id,
                'type'    => $alert->type,
                'message' => $alert->message,
            ]),
        ];
    }
}
