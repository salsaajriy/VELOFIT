<?php
// app/Http/Controllers/Api/IoTController.php
 
namespace App\Http\Controllers\Api;
 
use App\Http\Controllers\Controller;
use App\Models\{Ride, RideAlert, Helmet};
use App\Services\RideStatsService;
use Illuminate\Http\{JsonResponse, Request};
 
class IoTController extends Controller
{
    public function __construct(
        private readonly RideStatsService $statsService
    ) {}
 
    /**
     * POST /api/iot/location
     * Endpoint untuk ESP32 helmet
     * Tidak butuh auth user — gunakan device_code sebagai autentikasi
     */
    public function receiveData(Request $request): JsonResponse
    {
        $data = $request->validate([
            'device_code'      => 'required|string',
            'latitude'         => 'required|numeric',
            'longitude'        => 'required|numeric',
            'body_temperature' => 'nullable|numeric',
            'impact_detected'  => 'nullable|boolean',
        ]);
 
        $device = Helmet::where('device_code', $data['device_code'])
            ->where('is_active', true)
            ->first();
 
        if (!$device) {
            return response()->json([
                'success' => false,
                'message' => 'Device tidak dikenal.',
            ], 401);
        }
 
        // Update last ping
        $device->update(['last_ping' => now()]);
 
        // Cari ride aktif user device ini
        $activeRide = Ride::where('user_id', $device->user_id)
            ->where('status', 'active')
            ->latest()
            ->first();
 
        if (!$activeRide) {
            return response()->json(['success' => true, 'message' => 'No active ride.']);
        }
 
        // Check alert dari data IoT
        $alert = $this->statsService->checkAlerts($data);
        if ($alert) {
            RideAlert::create([
                'ride_id'  => $activeRide->id,
                'type'     => $alert['type'],
                'message'  => $alert['message'],
                'metadata' => $alert['metadata'],
            ]);
        }
 
        return response()->json([
            'success'    => true,
            'alert_sent' => !is_null($alert),
        ]);
    }
}
