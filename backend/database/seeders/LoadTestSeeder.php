<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Helmet;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class LoadTestSeeder extends Seeder
{
    public function run(): void
    {
        for ($i = 1; $i <= 1000; $i++) {

            $user = User::updateOrCreate(
                [
                    'email' => "loadtest{$i}@gmail.com",
                ],
                [
                    'name' => "Load Test User {$i}",
                    'password' => Hash::make('password123'),
                    'role' => 'user',
                    'weight' => rand(45,80),
                    'height' => rand(150,180),
                    'gender' => rand(0,1) ? 'male' : 'female',
                    'birth_date' => now()->subYears(rand(18,35)),
                ]
            );

            Helmet::updateOrCreate(
                [
                    'bluetooth_device_name' => "VELOFIT-BLE-{$i}",
                ],
                [
                    'user_id' => $user->id,
                    'helmet_name' => "VELOFIT Helmet {$i}",
                    'is_active' => true,
                ]
            );
        }
    }
}