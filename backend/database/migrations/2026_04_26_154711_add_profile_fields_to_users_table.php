<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->float('height')->nullable();

            $table->string('contact1')->nullable();
            $table->string('contact2')->nullable();

            $table->string('name1')->nullable();
            $table->string('name2')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'height',
                'contact1',
                'contact2',
                'name1',
                'name2',
            ]);
        });
    }
};