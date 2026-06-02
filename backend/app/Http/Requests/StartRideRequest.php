<?php

namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;
 
class StartRideRequest extends FormRequest
{
    public function authorize(): bool { return true; }
 
    public function rules(): array
    {
        return [

            'mode' => [
                'required',
                'in:free,navigation'
            ],
            'route_name' => [
                'nullable',
                'string',
                'max:255'
            ],
            'destination_lat' => [
                'required_if:mode,navigation',
                'numeric'
            ],
            'destination_lng' => [
                'required_if:mode,navigation',
                'numeric'
            ],
        ];
    }
}
