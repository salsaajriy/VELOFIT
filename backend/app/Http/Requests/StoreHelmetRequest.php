<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreHelmetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'helmet_name'           => ['required', 'string', 'max:100'],
            'bluetooth_device_name' => ['required', 'string', 'max:50'],
        ];
    }
}