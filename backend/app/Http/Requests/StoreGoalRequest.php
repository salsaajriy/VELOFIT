<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreGoalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'metric_type' => [
                'required',
                'in:distance,calories,duration,rides',
            ],

            'period' => [
                'required',
                'in:daily,weekly',
            ],

            'target_value' => [
                'required',
                'numeric',
                'min:1',
            ],
        ];
    }
}