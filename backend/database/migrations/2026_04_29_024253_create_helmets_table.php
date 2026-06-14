<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('helmets', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->string('helmet_name');
            $table->string('bluetooth_device_name')
                ->unique();
            $table->boolean('is_active')
                ->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::table('helmets', function (Blueprint $table) {
            $table->dropColumn(['bluetooth_device_name']);
        });
    }
};