<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class WeatherService
{
    protected $apiKey;
    protected $baseUrl;

    public function __construct()
    {
        $this->apiKey = config('services.weather.key');
        $this->baseUrl = config('services.weather.base_url');
    }

    public function getCurrentWeather($latitude, $longitude)
    {
        $response = Http::get($this->baseUrl . '/current.json', [
            'key' => $this->apiKey,
            'q' => $latitude . ',' . $longitude,
        ]);

        if (!$response->successful()) {
            return [
                'success' => false,
                'message' => 'Failed to fetch current weather.',
            ];
        }

        $data = $response->json();

        return [
            'success' => true,
            'location' => $data['location']['name'],
            'temperature' => $data['current']['temp_c'],
            'condition' => $data['current']['condition']['text'],
            'icon' => 'https:' . $data['current']['condition']['icon'],
            'humidity' => $data['current']['humidity'],
            'wind_kph' => $data['current']['wind_kph'],
            'last_updated' => $data['current']['last_updated'],
        ];
    }

    public function getForecast($latitude, $longitude)
    {
        $response = Http::get($this->baseUrl . '/forecast.json', [
            'key' => $this->apiKey,
            'q' => $latitude . ',' . $longitude,
            'days' => 1,
            'aqi' => 'no',
            'alerts' => 'yes',
        ]);

        if (!$response->successful()) {
            return [
                'success' => false,
                'message' => 'Failed to fetch forecast.',
            ];
        }

        $data = $response->json();

        $forecast = [];

        foreach ($data['forecast']['forecastday'][0]['hour'] as $hour) {
            $forecast[] = [
                'time' => $hour['time'],
                'temperature' => $hour['temp_c'],
                'condition' => $hour['condition']['text'],
                'icon' => 'https:' . $hour['condition']['icon'],
                'chance_of_rain' => $hour['chance_of_rain'],
                'will_rain' => $hour['will_it_rain'],
            ];
        }

        return [
            'success' => true,
            'location' => $data['location']['name'],
            'forecast' => $forecast,
        ];
    }
}