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
        Schema::create('stock_opname_photos', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('stock_opname_detail_id');
            $table->string('file_path');
            $table->string('file_name');
            $table->string('mime_type');
            $table->unsignedBigInteger('file_size');
            $table->integer('sequence')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('stock_opname_detail_id')->references('id')->on('stock_opname_details')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_opname_photos');
    }
};
