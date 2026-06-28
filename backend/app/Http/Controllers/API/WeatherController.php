<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\WeatherService;
use Illuminate\Http\Request;

class WeatherController extends Controller
{
    protected WeatherService $weatherService;

    public function __construct(WeatherService $weatherService)
    {
        $this->weatherService = $weatherService;
    }

    public function current(Request $request)
    {
        $request->validate([
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
        ]);

        $weather = $this->weatherService->getCurrentWeather(
            $request->lat,
            $request->lng
        );

        return response()->json($weather);
    }

    public function forecast(Request $request)
    {
        $request->validate([
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
        ]);

        $forecast = $this->weatherService->getForecast(
            $request->lat,
            $request->lng
        );

        return response()->json($forecast);
    }
}