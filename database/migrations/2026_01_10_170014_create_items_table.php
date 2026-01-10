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
        Schema::create('items', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('kode_barang', 20)->unique();
            $table->string('nama_barang', 255);
            $table->string('satuan', 20);
            $table->string('kategori', 100);
            $table->integer('stok')->default(0);
            $table->integer('stok_minimal')->default(0);
            $table->integer('stok_maksimal')->nullable();
            $table->decimal('harga_beli_terakhir', 15, 2)->nullable();
            $table->decimal('harga_rata_rata', 15, 2)->nullable();
            $table->decimal('harga_jual', 15, 2)->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('items');
    }
};
