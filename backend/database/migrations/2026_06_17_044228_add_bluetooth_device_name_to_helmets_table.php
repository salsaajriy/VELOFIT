<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('helmets', function (Blueprint $table) {
            $table->string('bluetooth_device_name')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('helmets', function (Blueprint $table) {
            $table->dropColumn('bluetooth_device_name');
        });
    }
};
