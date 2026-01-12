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
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('actor_id')->constrained('users')->onDelete('cascade');
            $table->string('action');
            $table->json('changes')->nullable();
            $table->timestamps();

            // Indexes for filtering
            $table->index('user_id', 'audit_logs_user_id_index');
            $table->index('actor_id', 'audit_logs_actor_id_index');
            $table->index('action', 'audit_logs_action_index');
            $table->index('created_at', 'audit_logs_created_at_index');

            // Composite indexes for common query patterns
            $table->index(['user_id', 'created_at'], 'audit_logs_user_id_created_at_index');
            $table->index(['actor_id', 'created_at'], 'audit_logs_actor_id_created_at_index');
            $table->index(['action', 'created_at'], 'audit_logs_action_created_at_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
