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
        Schema::table('users', function (Blueprint $table) {
            // Index for search queries (name, email, nip LIKE searches)
            $table->index('name', 'users_name_index');
            $table->index('email', 'users_email_index');
            $table->index('nip', 'users_nip_index');

            // Index for active filter
            $table->index('is_active', 'users_is_active_index');

            // Composite index for filtered + sorted queries (most common pattern)
            $table->index(['is_active', 'name'], 'users_is_active_name_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('users_name_index');
            $table->dropIndex('users_email_index');
            $table->dropIndex('users_nip_index');
            $table->dropIndex('users_is_active_index');
            $table->dropIndex('users_is_active_name_index');
        });
    }
};
