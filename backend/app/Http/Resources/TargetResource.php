<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TargetResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isObject = is_object($this->resource);
        
        return [
            'id'         => $isObject ? $this->id : ($this->resource['id'] ?? null),
            'type'       => $isObject ? $this->type : ($this->resource['type'] ?? null),
            'distance'   => $isObject ? $this->distance : ($this->resource['distance'] ?? null),
            'start_date' => $isObject 
                ? ($this->start_date?->toDateString() ?? $this->start_date) 
                : ($this->resource['start_date'] ?? null),
            'end_date'   => $isObject 
                ? ($this->end_date?->toDateString() ?? $this->end_date) 
                : ($this->resource['end_date'] ?? null),
            'is_active'  => $isObject ? (bool) $this->is_active : (bool) ($this->resource['is_active'] ?? false),
            'created_at' => $isObject 
                ? $this->created_at?->toISOString() 
                : ($this->resource['created_at'] ?? null),
            'updated_at' => $isObject 
                ? $this->updated_at?->toISOString() 
                : ($this->resource['updated_at'] ?? null),
        ];
    }
}