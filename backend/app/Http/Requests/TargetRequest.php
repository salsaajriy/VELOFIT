<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TargetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type'     => ['required', Rule::in(['daily', 'weekly'])],
            'distance' => ['required', 'numeric', 'min:0.1', 'max:1000'],
        ];
    }
}