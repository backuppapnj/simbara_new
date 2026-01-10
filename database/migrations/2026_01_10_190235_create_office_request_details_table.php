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
        Schema::create('office_request_details', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('request_id');
            $table->ulid('supply_id');
            $table->integer('jumlah');
            $table->integer('jumlah_diberikan')->nullable();
            $table->timestamps();

            $table->foreign('request_id')->references('id')->on('office_requests')->onDelete('cascade');
            $table->foreign('supply_id')->references('id')->on('office_supplies')->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('office_request_details');
    }
};
