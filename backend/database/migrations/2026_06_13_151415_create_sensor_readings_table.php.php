<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sensor_readings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ride_id')->constrained()->cascadeOnDelete();
            $table->foreignId('helmet_id')->constrained()->cascadeOnDelete();
            $table->decimal('body_temperature', 5, 2)->nullable();
            $table->decimal('room_temperature', 5, 2)->nullable();
            $table->decimal('impact_g', 6, 3)->nullable();
            $table->unsignedTinyInteger('alert_state')->default(0);
            $table->timestamp('recorded_at')->useCurrent();

            $table->index(['ride_id', 'recorded_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sensor_readings');
    }
};