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
        Schema::create('assets', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->bigInteger('id_aset')->nullable()->index();
            $table->string('kd_brg', 20)->nullable()->index();
            $table->integer('no_aset')->nullable();
            $table->string('kode_register', 50)->nullable();
            $table->string('nama', 255)->nullable();
            $table->string('merk', 100)->nullable();
            $table->string('tipe', 100)->nullable();
            $table->text('ur_sskel')->nullable();
            $table->integer('kd_jns_bmn')->nullable();
            $table->string('kd_kondisi', 2)->nullable()->index();
            $table->string('ur_kondisi', 50)->nullable();
            $table->string('kd_status', 5)->nullable()->index();
            $table->text('ur_status')->nullable();
            $table->string('tercatat', 5)->nullable();
            $table->decimal('rph_aset', 15, 2)->nullable();
            $table->decimal('rph_susut', 15, 2)->nullable();
            $table->decimal('rph_buku', 15, 2)->nullable();
            $table->decimal('rph_perolehan', 15, 2)->nullable();
            $table->date('tgl_perlh')->nullable();
            $table->date('tgl_rekam')->nullable();
            $table->date('tgl_rekam_pertama')->nullable();
            $table->string('lokasi_ruang', 100)->nullable();
            $table->ulid('lokasi_id')->nullable();
            $table->string('asl_perlh', 100)->nullable();
            $table->string('kd_satker', 50)->nullable();
            $table->string('ur_satker', 100)->nullable();
            $table->integer('jml_photo')->nullable();
            $table->integer('umur_sisa')->nullable();
            $table->foreignId('penanggung_jawab_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('lokasi_id')->references('id')->on('locations')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assets');
    }
};
