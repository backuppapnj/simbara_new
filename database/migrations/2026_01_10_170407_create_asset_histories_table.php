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
        Schema::create('asset_histories', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('asset_id');
            $table->ulid('lokasi_id_lama')->nullable();
            $table->ulid('lokasi_id_baru')->nullable();
            $table->ulid('user_id')->nullable();
            $table->text('keterangan')->nullable();
            $table->timestamps();

            $table->foreign('asset_id')->references('id')->on('assets')->onDelete('cascade');
            $table->foreign('lokasi_id_lama')->references('id')->on('locations')->onDelete('set null');
            $table->foreign('lokasi_id_baru')->references('id')->on('locations')->onDelete('set null');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asset_histories');
    }
};
