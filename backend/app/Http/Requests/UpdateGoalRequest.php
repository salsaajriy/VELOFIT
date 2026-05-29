<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateGoalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'target_value' => [
                'required',
                'numeric',
                'min:1',
            ],

            'is_active' => [
                'sometimes',
                'boolean',
            ],
        ];
    }
}