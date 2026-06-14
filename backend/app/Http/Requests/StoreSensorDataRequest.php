<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSensorDataRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'helmet_id' => ['required', 'integer', 'exists:helmets,id'],
            'body'      => ['required', 'numeric'],
            'room'      => ['required', 'numeric'],
            'g'         => ['required', 'numeric'],
            'lat'       => ['required', 'numeric', 'between:-90,90'],
            'lon'       => ['required', 'numeric', 'between:-180,180'],
            'gpsOk'     => ['required', 'boolean'],
            'alert'     => ['required', 'integer', 'between:0,2'],
        ];
    }
}