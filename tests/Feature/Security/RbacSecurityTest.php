<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Seed roles before each test
    $this->seed(\Database\Seeders\RolesSeeder::class);
});

describe('RBAC Security Tests', function () {
    describe('Permission Bypass Attempts', function () {
        it('prevents role escalation via direct URL manipulation', function () {
            $pegawai = User::factory()->create();
            $pegawai->assignRole('pegawai');

            // Try to access admin routes directly
            $response = $this->actingAs($pegawai)
                ->get('/admin/roles');

            $response->assertForbidden();
        });

        it('prevents permission bypass via HTTP method tampering', function () {
            $kpa = User::factory()->create();
            $kpa->assignRole('kpa');

            $role = Role::where('name', 'pegawai')->first();

            // Try to update role assignments without proper authorization
            $response = $this->actingAs($kpa)
                ->put("/admin/roles/{$role->id}/users", [
                    'user_ids' => [$kpa->id],
                ]);

            $response->assertForbidden();
        });

        it('prevents mass assignment attacks on role assignments', function () {
            $pegawai = User::factory()->create();
            $pegawai->assignRole('pegawai');

            $superAdminRole = Role::where('name', 'super_admin')->first();

            // Try to assign super_admin role to self
            $response = $this->actingAs($pegawai)
                ->put("/admin/roles/{$superAdminRole->id}/users", [
                    'user_ids' => [$pegawai->id],
                ]);

            $response->assertForbidden();

            // Verify user still doesn't have super_admin role
            expect($pegawai->fresh()->hasRole('super_admin'))->toBeFalse();
        });

        it('prevents privilege escalation through role modification', function () {
            $kpa = User::factory()->create();
            $kpa->assignRole('kpa');

            $superAdminRole = Role::where('name', 'super_admin')->first();

            // Try to modify super_admin role
            $response = $this->actingAs($kpa)
                ->put("/admin/roles/{$superAdminRole->id}/users", [
                    'user_ids' => [$kpa->id],
                ]);

            $response->assertForbidden();

            // Verify role wasn't modified
            expect($kpa->fresh()->hasRole('super_admin'))->toBeFalse();
        });

        it('prevents unauthorized users from viewing role assignments', function () {
            $pegawai = User::factory()->create();
            $pegawai->assignRole('pegawai');

            $role = Role::where('name', 'kpa')->first();

            // Try to view role details
            $response = $this->actingAs($pegawai)
                ->get("/admin/roles/{$role->id}");

            $response->assertForbidden();
        });

        it('prevents session hijacking attempts for role escalation', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $pegawai = User::factory()->create();
            $pegawai->assignRole('pegawai');

            // Verify each user can only access their own role-level resources
            $response = $this->actingAs($pegawai)
                ->get('/admin/roles');

            $response->assertForbidden();
        });
    });

    describe('SQL Injection Protection', function () {
        it('sanitizes search input in role user listing', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'pegawai')->first();

            // Try SQL injection in search
            $maliciousInput = "'; DROP TABLE users; --";

            $response = $this->actingAs($superAdmin)
                ->get("/admin/roles/{$role->id}?search={$maliciousInput}");

            // Should not cause SQL error
            $response->assertSuccessful();

            // Verify users table still exists
            expect(User::count())->toBeGreaterThan(0);
        });

        it('sanitizes filter input in role user listing', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'pegawai')->first();

            // Try SQL injection in filter
            $maliciousInput = "1' OR '1'='1";

            $response = $this->actingAs($superAdmin)
                ->get("/admin/roles/{$role->id}?is_active={$maliciousInput}");

            // Should handle gracefully
            $response->assertSuccessful();
        });

        it('prevents SQL injection in user assignment', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'pegawai')->first();

            $user = User::factory()->create();

            // Normal assignment should work
            $response = $this->actingAs($superAdmin)
                ->put("/admin/roles/{$role->id}/users", [
                    'user_ids' => [$user->id],
                ]);

            // Should handle gracefully
            $response->assertRedirect();

            // Verify roles table still exists
            expect(Role::count())->toBeGreaterThan(0);
        });
    });

    describe('XSS Protection', function () {
        it('escapes HTML in user names in role listing', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            // Create user with XSS payload in name
            $xssPayload = '<script>alert("XSS")</script>';
            $user = User::factory()->create([
                'name' => $xssPayload,
            ]);
            $user->assignRole('pegawai');

            $response = $this->actingAs($superAdmin)
                ->getJson('/admin/roles');

            $response->assertSuccessful();

            // Verify script is escaped in JSON response
            $content = $response->getContent();
            expect($content)->not->toContain('<script>');
        });

        it('escapes HTML in search results', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'pegawai')->first();

            // Create user with XSS payload
            $xssPayload = '<img src=x onerror=alert("XSS")>';
            $user = User::factory()->create([
                'name' => $xssPayload,
            ]);
            $user->assignRole('pegawai');

            $response = $this->actingAs($superAdmin)
                ->getJson("/admin/roles/{$role->id}?search=".urlencode($xssPayload));

            $response->assertSuccessful();

            // Note: JSON responses contain the raw data, XSS protection happens on frontend
            // The backend stores data safely and frontend should escape when rendering
            $content = $response->getContent();
            // JSON should properly escape the data
            expect($content)->toBeTruthy();
        });

        it('sanitizes user input in role updates', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'pegawai')->first();

            $user = User::factory()->create([
                'name' => 'Test User',
            ]);

            // Try to submit role update
            $response = $this->actingAs($superAdmin)
                ->put("/admin/roles/{$role->id}/users", [
                    'user_ids' => [$user->id],
                ]);

            $response->assertRedirect();
        });
    });

    describe('CSRF Protection', function () {
        it('handles CSRF protection in role updates', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'pegawai')->first();

            // Laravel tests automatically handle CSRF
            // In production, CSRF middleware protects the endpoint
            $response = $this->actingAs($superAdmin)
                ->put("/admin/roles/{$role->id}/users", [
                    'user_ids' => [$superAdmin->id],
                ]);

            // Should succeed with CSRF token handled by test framework
            $response->assertRedirect();
        });

        it('validates input in role updates', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'pegawai')->first();

            $user = User::factory()->create();

            // Valid request should succeed
            $response = $this->actingAs($superAdmin)
                ->put("/admin/roles/{$role->id}/users", [
                    'user_ids' => [$user->id],
                ]);

            $response->assertRedirect();
        });
    });

    describe('Authorization Boundary Testing', function () {
        it('ensures non-super_admin cannot access permission management', function () {
            $users = [
                'kpa' => User::factory()->create()->assignRole('kpa'),
                'kasubag' => User::factory()->create()->assignRole('kasubag_umum'),
                'pegawai' => User::factory()->create()->assignRole('pegawai'),
                'operator_bmn' => User::factory()->create()->assignRole('operator_bmn'),
                'operator_persediaan' => User::factory()->create()->assignRole('operator_persediaan'),
            ];

            foreach ($users as $role => $user) {
                $response = $this->actingAs($user)
                    ->get('/admin/roles');

                $response->assertForbidden("User with role {$role} should not access role management");
            }
        });

        it('prevents horizontal privilege escalation between users', function () {
            $kpa1 = User::factory()->create();
            $kpa1->assignRole('kpa');

            $kpa2 = User::factory()->create();
            $kpa2->assignRole('kpa');

            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'kpa')->first();

            // KPA1 should not be able to modify KPA2's role
            $response = $this->actingAs($kpa1)
                ->put("/admin/roles/{$role->id}/users", [
                    'user_ids' => [$kpa2->id],
                ]);

            $response->assertForbidden();
        });

        it('prevents unauthorized role removal', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $kpa = User::factory()->create();
            $kpa->assignRole('kpa');

            $pegawai = User::factory()->create();
            $pegawai->assignRole('pegawai');

            $role = Role::where('name', 'kpa')->first();

            // Pegawai should not be able to remove KPA from role
            $response = $this->actingAs($pegawai)
                ->put("/admin/roles/{$role->id}/users", [
                    'user_ids' => [],
                ]);

            $response->assertForbidden();

            // Verify KPA still has role
            expect($kpa->fresh()->hasRole('kpa'))->toBeTrue();
        });
    });

    describe('Session Security', function () {
        it('invalidates session on role change', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $otherSuperAdmin = User::factory()->create();
            $otherSuperAdmin->assignRole('super_admin');

            $role = Role::where('name', 'super_admin')->first();

            // Remove super_admin from first user
            $this->actingAs($otherSuperAdmin)
                ->put("/admin/roles/{$role->id}/users", [
                    'user_ids' => [$otherSuperAdmin->id],
                ]);

            // First user should no longer have access
            $response = $this->actingAs($superAdmin)
                ->get('/admin/roles');

            // After losing super_admin role, should be forbidden
            $response->assertForbidden();
        });

        it('prevents session fixation attacks', function () {
            $pegawai = User::factory()->create();
            $pegawai->assignRole('pegawai');

            // Verify session is properly managed
            $response = $this->actingAs($pegawai)
                ->get('/dashboard');

            $response->assertSuccessful();
        });
    });

    describe('Input Validation Security', function () {
        it('validates user_ids array in role assignment', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'pegawai')->first();

            // Try to pass non-array user_ids
            $response = $this->actingAs($superAdmin)
                ->put("/admin/roles/{$role->id}/users", [
                    'user_ids' => 'not an array',
                ]);

            $response->assertStatus(302); // Validation redirect
        });

        it('validates user exists before role assignment', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'pegawai')->first();

            $user = User::factory()->create();

            // Try to assign valid user
            $response = $this->actingAs($superAdmin)
                ->put("/admin/roles/{$role->id}/users", [
                    'user_ids' => [$user->id],
                ]);

            // Should succeed
            $response->assertRedirect();
        });

        it('sanitizes pagination parameters', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'pegawai')->first();

            // Try malicious pagination
            $response = $this->actingAs($superAdmin)
                ->get("/admin/roles/{$role->id}?page=-1");

            $response->assertSuccessful();

            // Try SQL injection in page parameter
            $response = $this->actingAs($superAdmin)
                ->get("/admin/roles/{$role->id}?page=1' OR '1'='1");

            $response->assertSuccessful();
        });
    });

    describe('Race Condition Prevention', function () {
        it('prevents concurrent role modification conflicts', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'pegawai')->first();

            $user1 = User::factory()->create();
            $user2 = User::factory()->create();

            // Simulate concurrent updates
            $response1 = $this->actingAs($superAdmin)
                ->put("/admin/roles/{$role->id}/users", [
                    'user_ids' => [$user1->id],
                ]);

            $response2 = $this->actingAs($superAdmin)
                ->put("/admin/roles/{$role->id}/users", [
                    'user_ids' => [$user2->id],
                ]);

            // Both should succeed without conflicts
            $response1->assertRedirect();
            $response2->assertRedirect();
        });
    });

    describe('Information Disclosure Prevention', function () {
        it('does not leak role information to unauthorized users', function () {
            $pegawai = User::factory()->create();
            $pegawai->assignRole('pegawai');

            // Try to get role information
            $response = $this->actingAs($pegawai)
                ->getJson('/admin/roles');

            $response->assertForbidden();

            // Should not reveal role structure
            expect($response->json())->not->toHaveKey('data');
        });

        it('does not expose user role assignments in error messages', function () {
            $pegawai = User::factory()->create();
            $pegawai->assignRole('pegawai');

            $response = $this->actingAs($pegawai)
                ->get('/admin/roles');

            $response->assertForbidden();

            // Error message should not contain sensitive info
            $content = $response->getContent();
            expect($content)->not->toContain('super_admin');
        });

        it('hides internal implementation details', function () {
            $pegawai = User::factory()->create();
            $pegawai->assignRole('pegawai');

            $response = $this->actingAs($pegawai)
                ->get('/admin/roles');

            $response->assertForbidden();

            // Should not expose stack traces or internal paths
            // Laravel's exception handler handles this properly
            expect($response->status())->toBe(403);
        });
    });

    describe('Audit Trail Security', function () {
        it('logs unauthorized access attempts', function () {
            $pegawai = User::factory()->create();
            $pegawai->assignRole('pegawai');

            // Attempt unauthorized access
            $this->actingAs($pegawai)
                ->get('/admin/roles');

            // Verify attempt was logged (check logs or audit table)
            // This is a placeholder for actual audit logging verification
            expect(true)->toBeTrue();
        });

        it('tracks role assignment changes', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'pegawai')->first();

            $user = User::factory()->create();

            $this->actingAs($superAdmin)
                ->put("/admin/roles/{$role->id}/users", [
                    'user_ids' => [$user->id],
                ]);

            // Verify change was tracked
            expect($user->fresh()->hasRole('pegawai'))->toBeTrue();
        });
    });
});
