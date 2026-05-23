<?php

namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;
 
class StartRideRequest extends FormRequest
{
    public function authorize(): bool { return true; }
 
    public function rules(): array
    {
        return [
            'mode' => 'nullable|string|in:free,navigation',
            'route_name' => 'nullable|string|max:255',
        ];
    }
}
 
class LocationRequest extends FormRequest
{
    public function authorize(): bool { return true; }
 
    public function rules(): array
    {
        return [
            'locations'             => 'required|array|min:1|max:100',
            'locations.*.latitude'  => 'required|numeric|between:-90,90',
            'locations.*.longitude' => 'required|numeric|between:-180,180',
            'locations.*.speed'     => 'nullable|numeric|min:0',
            'locations.*.recorded_at' => 'nullable|date',
        ];
    }
}
 
class FinishRideRequest extends FormRequest
{
    public function authorize(): bool { return true; }
 
    public function rules(): array
    {
        return [
            'distance' => 'required|numeric|min:0',
            'duration' => 'required|integer|min:0',
            'avg_speed'=> 'required|numeric|min:0',
            'max_speed'=> 'required|numeric|min:0',
            'calories' => 'required|numeric|min:0',
        ];
    }
}
