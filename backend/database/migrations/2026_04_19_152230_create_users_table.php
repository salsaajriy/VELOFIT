<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id(); // BIGINT auto increment (setara SERIAL tapi lebih modern)

            $table->string('name', 100)->nullable();
            $table->string('email', 150)->unique();
            $table->text('password')->nullable();

            $table->string('google_id')->nullable();
            $table->text('avatar')->nullable();

            $table->timestamps(); // created_at & updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};