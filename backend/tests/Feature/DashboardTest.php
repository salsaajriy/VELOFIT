<?php

namespace Tests\Feature;

use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    public function test_dashboard_can_be_accessed()
    {
        $user = User::first();

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/user/dashboard');

        $response->assertStatus(200);
    }
}