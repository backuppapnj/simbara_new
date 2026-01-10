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
        Schema::create('office_purchase_details', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('purchase_id');
            $table->ulid('supply_id');
            $table->integer('jumlah');
            $table->decimal('subtotal', 15, 2)->nullable();
            $table->timestamps();

            $table->foreign('purchase_id')->references('id')->on('office_purchases')->onDelete('cascade');
            $table->foreign('supply_id')->references('id')->on('office_supplies')->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('office_purchase_details');
    }
};
