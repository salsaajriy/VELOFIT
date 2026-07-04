<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Ride;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class EmergencyController extends Controller
{
    public function send(Request $request)
    {
        $request->validate([
            'ride_id' => 'required|exists:rides,id',
        ]);

        $user = request()->user();

        // Pastikan ride milik user
        $ride = Ride::where('id', $request->ride_id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        // Ambil lokasi terakhir
        $lastLocation = $ride->locations()
            ->latest('recorded_at')
            ->first();

        if (!$lastLocation) {
            return response()->json([
                'success' => false,
                'message' => 'Ride location not found.'
            ], 404);
        }

        // Google Maps URL
        $location = sprintf(
            '%.6f,%.6f',
            $lastLocation->latitude,
            $lastLocation->longitude
        );

        $time = Carbon::now()->format('d M Y H:i');

        $sendWhatsapp = function ($phone, $contactName) use ($user, $time, $location) {

            if (!$phone) {
                return null;
            }

            // Ubah 08xxxx menjadi 628xxxx
            $phone = preg_replace('/^0/', '62', $phone);

            $response = Http::timeout(10)->post(
                'https://console.zenziva.net/waofficial/api/sendnotif/',
                [
                    "userkey" => env('ZENZIVA_USERKEY'),
                    "passkey" => env('ZENZIVA_PASSKEY'),
                    "to" => $phone,
                    "template" => [
                        "name" => "velofit_emergency",
                        "parameters" => [
                            [
                                "type" => "text",
                                "text" => $contactName ?: "Emergency Contact"
                            ],
                            [
                                "type" => "text",
                                "text" => $user->name
                            ],
                            [
                                "type" => "text",
                                "text" => $time
                            ],
                            [
                                "type" => "text",
                                "text" => $location
                            ]
                        ]
                    ]
                ]
            );

            return $response->json();
        };

        $contact1 = $sendWhatsapp(
            $user->contact1,
            $user->name1
        );

        $contact2 = $sendWhatsapp(
            $user->contact2,
            $user->name2
        );

        return response()->json([
            'success' => true,
            'message' => 'Emergency notification processed.',
            'contact1' => $contact1,
            'contact2' => $contact2,
        ]);
    }
}