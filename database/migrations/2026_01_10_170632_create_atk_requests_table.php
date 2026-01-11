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
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
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
            $table->foreignId('level1_approval_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('level1_approval_at')->nullable();
            $table->foreignId('level2_approval_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('level2_approval_at')->nullable();
            $table->foreignId('level3_approval_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('level3_approval_at')->nullable();
            $table->text('keterangan')->nullable();
            $table->text('alasan_penolakan')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('department_id')->references('id')->on('departments')->onDelete('restrict');
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
