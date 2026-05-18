<?php

namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;
 
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
