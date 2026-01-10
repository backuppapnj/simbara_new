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
        Schema::create('atk_requests', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('no_permintaan', 50)->unique();
            $table->ulid('user_id');
            $table->ulid('department_id');
            $table->date('tanggal');
            $table->enum('status', [
                'pending',
                'level1_approved',
                'level2_approved',
                'level3_approved',
                'rejected',
                'diserahkan',
                'diterima',
            ])->default('pending');
            $table->ulid('level1_approval_by')->nullable();
            $table->timestamp('level1_approval_at')->nullable();
            $table->ulid('level2_approval_by')->nullable();
            $table->timestamp('level2_approval_at')->nullable();
            $table->ulid('level3_approval_by')->nullable();
            $table->timestamp('level3_approval_at')->nullable();
            $table->text('keterangan')->nullable();
            $table->text('alasan_penolakan')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('restrict');
            $table->foreign('department_id')->references('id')->on('departments')->onDelete('restrict');
            $table->foreign('level1_approval_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('level2_approval_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('level3_approval_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('atk_requests');
    }
};
