<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
 
return new class extends Migration {
    public function up(): void
    {
        Schema::create('rides', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                  ->constrained()
                  ->cascadeOnDelete();
            $table->string('mode')->default('free');
            $table->decimal('distance', 10, 3)->default(0); 
            $table->unsignedInteger('duration')->default(0); 
            $table->decimal('avg_speed', 6, 2)->default(0);   
            $table->decimal('max_speed', 6, 2)->default(0);   
            $table->decimal('calories', 8, 2)->default(0);    
            $table->string('status')->default('active');

            $table->decimal('start_lat', 10, 7)->nullable();
            $table->decimal('start_lng', 10, 7)->nullable();
            $table->decimal('end_lat', 10, 7)->nullable();
            $table->decimal('end_lng', 10, 7)->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('paused_at')->nullable();
            $table->timestamp('ended_at')->nullable();

            $table->unsignedInteger('auto_paused_count')
                  ->default(0);
            $table->string('completed_reason')
                  ->nullable();
            $table->string('route_name')->nullable();
            $table->string('source')->default('mobile');

            $table->timestamps();
 
            $table->index(['user_id', 'status']);
            $table->index('started_at');
        });
    }
 
    public function down(): void
    {
        Schema::dropIfExists('rides');
    }
};
