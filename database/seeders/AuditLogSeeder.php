<?php

namespace Database\Seeders;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Seeder;

class AuditLogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Only seed if we have users and no existing audit logs
        $userCount = User::count();
        $existingLogCount = AuditLog::count();

        if ($userCount === 0) {
            $this->command?->warn('No users found. Skipping audit log seeder.');

            return;
        }

        if ($existingLogCount > 0) {
            $this->command?->info("Audit logs already exist ({$existingLogCount}). Skipping seeder.");

            return;
        }

        $this->command?->info('Creating sample audit logs...');

        // Get some users for creating sample logs
        $users = User::limit(10)->get();

        if ($users->count() < 2) {
            $this->command?->warn('Not enough users to create sample audit logs.');

            return;
        }

        // Create sample audit logs using factory instead of raw insert
        // This ensures proper JSON casting for both MySQL and SQLite

        // User creation logs
        foreach ($users->take(3) as $index => $user) {
            $actor = $users->first(); // Use first user as actor

            AuditLog::create([
                'user_id' => $user->id,
                'actor_id' => $actor->id,
                'action' => 'user_created',
                'changes' => [
                    'before' => null,
                    'after' => [
                        'name' => $user->name,
                        'email' => $user->email,
                        'nip' => $user->nip,
                    ],
                ],
                'created_at' => now()->subDays(rand(1, 30)),
                'updated_at' => now(),
            ]);
        }

        // User update logs
        foreach ($users->take(3) as $index => $user) {
            $actor = $users->first();

            AuditLog::create([
                'user_id' => $user->id,
                'actor_id' => $actor->id,
                'action' => 'user_updated',
                'changes' => [
                    'before' => ['name' => 'Old Name'],
                    'after' => ['name' => $user->name],
                ],
                'created_at' => now()->subDays(rand(1, 20)),
                'updated_at' => now(),
            ]);
        }

        // Role assignment logs
        foreach ($users->take(5) as $index => $user) {
            $actor = $users->first();
            $roles = $user->roles->pluck('name')->toArray();

            if (! empty($roles)) {
                AuditLog::create([
                    'user_id' => $user->id,
                    'actor_id' => $actor->id,
                    'action' => 'role_assigned',
                    'changes' => [
                        'before' => ['roles' => []],
                        'after' => ['roles' => $roles],
                    ],
                    'created_at' => now()->subDays(rand(1, 15)),
                    'updated_at' => now(),
                ]);
            }
        }

        // Role removal logs (a few examples)
        foreach ($users->take(2) as $index => $user) {
            $actor = $users->first();

            AuditLog::create([
                'user_id' => $user->id,
                'actor_id' => $actor->id,
                'action' => 'role_removed',
                'changes' => [
                    'before' => ['roles' => ['old_role']],
                    'after' => ['roles' => $user->roles->pluck('name')->toArray()],
                ],
                'created_at' => now()->subDays(rand(1, 10)),
                'updated_at' => now(),
            ]);
        }

        $count = AuditLog::count();
        $this->command?->info("Created {$count} sample audit logs.");
    }
}
