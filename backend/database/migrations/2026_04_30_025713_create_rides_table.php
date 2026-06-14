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
            $table->foreignId('helmet_id')->constrained()->cascadeOnDelete();
            $table->timestamp('start_time')->useCurrent();
            $table->timestamp('end_time')->nullable();
            $table->decimal('duration')->nullable()->comment('seconds');
            $table->decimal('distance', 10, 4)->default(0)->comment('km');
            $table->decimal('avg_speed', 8, 2)->default(0)->comment('km/h');
            $table->decimal('max_speed', 8, 2)->default(0)->comment('km/h');
            $table->decimal('calories', 8, 2)->default(0);
            $table->enum('status', ['active', 'completed'])->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rides');
    }
};