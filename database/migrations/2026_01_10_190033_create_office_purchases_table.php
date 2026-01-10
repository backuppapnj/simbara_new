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
        Schema::create('office_purchases', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('no_pembelian', 50)->unique();
            $table->date('tanggal');
            $table->string('supplier', 100);
            $table->decimal('total_nilai', 15, 2);
            $table->text('keterangan')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('office_purchases');
    }
};
