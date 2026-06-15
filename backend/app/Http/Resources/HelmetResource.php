<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HelmetResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                    => $this->id,
            'helmet_name'           => $this->helmet_name,
            'is_active'             => $this->is_active ?? false,
            'bluetooth_device_name' => $this->bluetooth_device_name,
            'created_at'            => $this->created_at->toISOString(),
        ];
    }
}