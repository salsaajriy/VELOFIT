<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rides', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name')->default('Untitled Ride');
            $table->timestamp('start_time');
            $table->timestamp('end_time')->nullable();
            $table->unsignedInteger('duration')->nullable()->comment('in seconds');
            $table->decimal('distance', 8, 3)->nullable()->comment('in km');
            $table->decimal('avg_speed', 6, 2)->nullable()->comment('in km/h');
            $table->unsignedInteger('calories')->nullable();
            $table->json('route')->nullable()->comment('array of {lat, lng} objects');
            $table->enum('status', ['active', 'completed', 'incomplete'])->default('active');
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rides');
    }
};