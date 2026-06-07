<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('ride_locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ride_id')
                  ->constrained()
                  ->cascadeOnDelete();
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->decimal('speed', 6, 2)->default(0);   
            $table->decimal('altitude', 8, 2)->nullable(); 
            $table->decimal('accuracy', 8, 2)
                  ->nullable();
            $table->timestamp('recorded_at');
            $table->timestamps();

            $table->index(['ride_id', 'recorded_at']);
        });
    }
 
    public function down(): void
    {
        Schema::dropIfExists('ride_locations');
    }
};
