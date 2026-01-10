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
        Schema::create('asset_condition_logs', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('asset_id');
            $table->string('kd_kondisi_lama', 2)->nullable();
            $table->string('kd_kondisi_baru', 2)->nullable();
            $table->string('ur_kondisi_lama', 50)->nullable();
            $table->string('ur_kondisi_baru', 50)->nullable();
            $table->text('alasan')->nullable();
            $table->ulid('user_id')->nullable();
            $table->timestamps();

            $table->foreign('asset_id')->references('id')->on('assets')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asset_condition_logs');
    }
};
