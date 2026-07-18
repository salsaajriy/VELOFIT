<?php

namespace Tests\Feature;

use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class HelmetTest extends TestCase
{
    public function test_get_user_helmets()
    {
        $user = User::first();

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/helmets');

        $response->assertStatus(200);
    }
}