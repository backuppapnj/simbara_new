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
        Schema::create('office_usages', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('supply_id');
            $table->integer('jumlah');
            $table->date('tanggal');
            $table->text('keperluan');
            $table->ulid('user_id');
            $table->timestamps();

            $table->foreign('supply_id')->references('id')->on('office_supplies')->onDelete('restrict');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('office_usages');
    }
};
