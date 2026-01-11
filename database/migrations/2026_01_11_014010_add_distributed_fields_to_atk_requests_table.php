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
        Schema::table('atk_requests', function (Blueprint $table) {
            $table->ulid('distributed_by')->nullable()->after('level3_approval_at');
            $table->timestamp('distributed_at')->nullable()->after('distributed_by');
            $table->timestamp('received_at')->nullable()->after('distributed_at');

            $table->foreign('distributed_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('atk_requests', function (Blueprint $table) {
            $table->dropForeign(['distributed_by']);
            $table->dropColumn(['distributed_by', 'distributed_at', 'received_at']);
        });
    }
};
