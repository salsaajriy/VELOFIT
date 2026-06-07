<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StartRideRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'mode' => 'required|in:free,navigation',
            'helmet_id' => 'required|exists:helmets,id',
        ];
    }
}