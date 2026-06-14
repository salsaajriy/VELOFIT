<?php

namespace App\Services;

use App\Models\Helmet;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class HelmetService
{

    public function getUserHelmets(User $user): Collection
    {
        return Helmet::where('user_id', $user->id)
            ->with('rides')
            ->orderBy('is_active', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getActiveHelmet(User $user): ?Helmet
    {
        return Helmet::where('user_id', $user->id)
            ->where('is_active', true)
            ->first();
    }

    public function registerHelmet(User $user, array $data): Helmet
    {
        return DB::transaction(function () use ($user, $data) {
            $helmet = Helmet::create([
                'user_id' => $user->id,
                'device_id' => $this->generateDeviceId(),
                'device_name' => $data['device_name'],
                'bluetooth_device_name' => $data['bluetooth_device_name'],
                'bluetooth_device_id' => $data['bluetooth_device_id'] ?? null,
                'battery' => null,
                'is_active' => false,
            ]);

            Log::info("New helmet registered", [
                'user_id' => $user->id,
                'helmet_id' => $helmet->id,
                'device_name' => $helmet->device_name,
            ]);

            return $helmet;
        });
    }

    public function updateHelmet(Helmet $helmet, array $data): Helmet
    {
        $helmet->update($data);
        
        Log::info("Helmet updated", [
            'helmet_id' => $helmet->id,
            'device_name' => $helmet->device_name,
        ]);

        return $helmet->fresh();
    }

    public function deleteHelmet(Helmet $helmet): bool
    {
        if ($helmet->is_active) {
            throw new \Exception('Cannot delete active helmet. Please deactivate it first.');
        }

        Log::info("Helmet deleted", [
            'helmet_id' => $helmet->id,
            'device_name' => $helmet->device_name,
        ]);

        return $helmet->delete();
    }

    public function setActiveHelmet(User $user, int $helmetId): Helmet
    {
        return DB::transaction(function () use ($user, $helmetId) {
            $helmet = Helmet::where('user_id', $user->id)
                ->where('id', $helmetId)
                ->firstOrFail();

            $helmet->activate();

            Log::info("Active helmet changed", [
                'user_id' => $user->id,
                'helmet_id' => $helmet->id,
            ]);

            return $helmet;
        });
    }

    public function updateHelmetStatus(Helmet $helmet, ?int $battery = null): void
    {
        $updateData = ['last_ping' => now()];
        
        if ($battery !== null) {
            $updateData['battery'] = $battery;
        }
        
        $helmet->update($updateData);
    }

    public function validateBLEConnection(User $user, string $deviceName): ?Helmet
    {
        return Helmet::where('user_id', $user->id)
            ->where('bluetooth_device_name', $deviceName)
            ->first();
    }

    private function generateDeviceId(): string
    {
        do {
            $deviceId = 'VF-' . strtoupper(substr(uniqid(), -8));
        } while (Helmet::where('device_id', $deviceId)->exists());

        return $deviceId;
    }


    public function getHelmetWithStatus(Helmet $helmet): array
    {
        return [
            'helmet' => $helmet,
            'status' => [
                'is_connected' => $helmet->isConnected(),
                'battery_level' => $helmet->battery,
                'last_seen' => $helmet->last_ping,
                'signal_strength' => null, // BLE RSSI
            ],
        ];
    }
}