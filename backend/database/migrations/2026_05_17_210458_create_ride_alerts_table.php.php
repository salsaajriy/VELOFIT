<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('ride_alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ride_id')
                  ->constrained()
                  ->cascadeOnDelete();
            $table->string('type');
            // type: impact | temperature | sos
            $table->string('message');
            $table->json('metadata')->nullable();
            $table->boolean('acknowledged')->default(false);
            $table->timestamps();
 
            $table->index(['ride_id', 'type']);
        });
    }
 
    public function down(): void
    {
        Schema::dropIfExists('ride_alerts');
    }
};
