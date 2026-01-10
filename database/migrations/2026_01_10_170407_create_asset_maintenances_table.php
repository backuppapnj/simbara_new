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
        Schema::create('asset_maintenances', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('asset_id');
            $table->string('jenis_perawatan', 100)->nullable();
            $table->date('tanggal')->nullable();
            $table->decimal('biaya', 15, 2)->nullable();
            $table->string('pelaksana', 100)->nullable();
            $table->text('keterangan')->nullable();
            $table->timestamps();

            $table->foreign('asset_id')->references('id')->on('assets')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asset_maintenances');
    }
};
