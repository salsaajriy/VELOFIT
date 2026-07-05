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

        $user = $request->user();

        $ride = Ride::where('id', $request->ride_id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $lastLocation = $ride->locations()
            ->latest('recorded_at')
            ->first();

        if (!$lastLocation) {
            return response()->json([
                'success' => false,
                'message' => 'Ride location not found.'
            ], 404);
        }

        $latitude = $lastLocation->latitude;
        $longitude = $lastLocation->longitude;

        $mapsUrl = "https://maps.google.com/?q={$latitude},{$longitude}";
        $time = Carbon::now()->format('d M Y H:i');

        $sendWhatsapp = function ($phone, $contactName) use ($user, $time, $mapsUrl) {

            if (empty($phone)) {
                return null;
            }

            // Bersihkan nomor
            $phone = preg_replace('/\D/', '', $phone);

            if (str_starts_with($phone, '08')) {
                $phone = '62' . substr($phone, 1);
            }

            $message =
                "🚨 VELOFIT EMERGENCY ALERT\n\n" .
                "Halo " . ($contactName ?: "Emergency Contact") . ",\n\n" .
                "{$user->name} diduga mengalami kecelakaan saat bersepeda.\n\n" .
                "Waktu : {$time}\n" .
                "Lokasi : {$mapsUrl}\n\n" .
                "Mohon segera hubungi atau datangi lokasi tersebut.";

            $response = Http::withHeaders([
                'Authorization' => env('FONNTE_TOKEN'),
            ])
                ->asForm()
                ->timeout(30)
                ->post('https://api.fonnte.com/send', [
                    'target'  => $phone,
                    'message' => $message,
                    'schedule' => 0,
                ]);

            return [
                'phone' => $phone,
                'http_status' => $response->status(),
                'success' => $response->successful(),
                'body' => $response->body(),
                'json' => $response->json(),
            ];
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