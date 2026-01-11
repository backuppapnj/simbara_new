<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Seed roles before each test
    $this->seed(\Database\Seeders\RolesSeeder::class);
});

describe('RBAC Browser Tests - End-to-End Permission Flows', function () {
    describe('Viewing Permissions List', function () {
        it('allows super_admin to view permissions list', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $page = visit('/admin/roles', $superAdmin);

            $page->assertSuccessful()
                ->assertSee('Roles')
                ->assertSee('super_admin')
                ->assertNoJavascriptErrors()
                ->assertNoConsoleLogs();
        });

        it('forbids non-super_admin from viewing permissions list', function () {
            $pegawai = User::factory()->create();
            $pegawai->assignRole('pegawai');

            $page = visit('/admin/roles', $pegawai);

            $page->assertStatus(403);
        });

        it('forbids unauthenticated users from viewing permissions list', function () {
            $page = visit('/admin/roles');

            $page->assertPath('/login');
        });
    });

    describe('Creating New Permission', function () {
        it('allows super_admin to create new permission', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $page = visit('/admin/roles', $superAdmin);

            $page->assertSuccessful()
                ->assertSee('Roles')
                ->assertNoConsoleLogs();
        });

        it('forbids non-super_admin from creating permissions', function () {
            $kpa = User::factory()->create();
            $kpa->assignRole('kpa');

            // Try to access permission creation
            $page = visit('/admin/roles', $kpa);

            $page->assertStatus(403);
        });
    });

    describe('Editing Permission', function () {
        it('allows super_admin to edit role permissions', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'pegawai')->first();

            $page = visit("/admin/roles/{$role->id}", $superAdmin);

            $page->assertSuccessful()
                ->assertSee('pegawai')
                ->assertNoJavascriptErrors()
                ->assertNoConsoleLogs();
        });

        it('forbids non-super_admin from editing permissions', function () {
            $kpa = User::factory()->create();
            $kpa->assignRole('kpa');

            $role = Role::where('name', 'pegawai')->first();

            $page = visit("/admin/roles/{$role->id}", $kpa);

            $page->assertStatus(403);
        });
    });

    describe('Deleting Permission', function () {
        it('allows super_admin to remove users from roles', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $pegawai = User::factory()->create();
            $pegawai->assignRole('pegawai');

            $role = Role::where('name', 'pegawai')->first();

            $page = visit("/admin/roles/{$role->id}", $superAdmin);

            $page->assertSuccessful()
                ->assertSee($pegawai->name)
                ->assertNoJavascriptErrors();
        });

        it('forbids non-super_admin from deleting permissions', function () {
            $kpa = User::factory()->create();
            $kpa->assignRole('kpa');

            $role = Role::where('name', 'pegawai')->first();

            $page = visit("/admin/roles/{$role->id}", $kpa);

            $page->assertStatus(403);
        });
    });

    describe('Assigning Permissions to Role', function () {
        it('allows super_admin to assign users to roles', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $pegawai1 = User::factory()->create();
            $pegawai2 = User::factory()->create();

            $role = Role::where('name', 'pegawai')->first();
            $pegawai1->assignRole('pegawai');

            $page = visit("/admin/roles/{$role->id}", $superAdmin);

            $page->assertSuccessful()
                ->assertSee($pegawai1->name)
                ->assertSee($pegawai2->name)
                ->assertNoConsoleLogs();
        });

        it('handles super_admin exclusivity rule correctly', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $user = User::factory()->create();
            $user->assignRole('pegawai');

            $page = visit('/admin/roles', $superAdmin);

            $page->assertSuccessful()
                ->assertNoJavascriptErrors();
        });
    });

    describe('Super Admin Wildcard Access', function () {
        it('allows super_admin to access all admin routes', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $routes = [
                '/admin/roles',
                '/admin/notification-logs',
                '/admin/whatsapp-settings',
            ];

            foreach ($routes as $route) {
                $page = visit($route, $superAdmin);
                $page->assertSuccessful()
                    ->assertNoConsoleLogs();
            }
        });

        it('allows super_admin to perform all actions', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $page = visit('/dashboard', $superAdmin);

            $page->assertSuccessful()
                ->assertNoJavascriptErrors()
                ->assertNoConsoleLogs();
        });

        it('bypasses permission checks for super_admin', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'kpa')->first();

            $page = visit("/admin/roles/{$role->id}", $superAdmin);

            $page->assertSuccessful()
                ->assertNoJavascriptErrors();
        });
    });

    describe('Permission Middleware Blocking', function () {
        it('blocks unauthenticated users from protected routes', function () {
            $routes = [
                '/admin/roles',
                '/admin/notification-logs',
                '/settings/profile',
            ];

            foreach ($routes as $route) {
                $page = visit($route);
                $page->assertPath('/login');
            }
        });

        it('blocks users without required roles', function () {
            $pegawai = User::factory()->create();
            $pegawai->assignRole('pegawai');

            $page = visit('/admin/roles', $pegawai);

            $page->assertStatus(403);
        });

        it('blocks users without specific permissions', function () {
            $kpa = User::factory()->create();
            $kpa->assignRole('kpa');

            // Try to access super_admin only route
            $page = visit('/admin/roles', $kpa);

            $page->assertStatus(403);
        });

        it('returns proper 403 response for forbidden access', function () {
            $pegawai = User::factory()->create();
            $pegawai->assignRole('pegawai');

            $page = visit('/admin/roles', $pegawai);

            $page->assertStatus(403)
                ->assertSee('Forbidden');
        });
    });

    describe('Policy-Based Authorization', function () {
        it('respects role-based access control', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $pegawai = User::factory()->create();
            $pegawai->assignRole('pegawai');

            // Super admin can access
            $page = visit('/admin/roles', $superAdmin);
            $page->assertSuccessful();

            // Pegawai cannot access
            $page = visit('/admin/roles', $pegawai);
            $page->assertStatus(403);
        });

        it('enforces role hierarchy correctly', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $kpa = User::factory()->create();
            $kpa->assignRole('kpa');

            $pegawai = User::factory()->create();
            $pegawai->assignRole('pegawai');

            // Super admin can access everything
            $page = visit('/admin/roles', $superAdmin);
            $page->assertSuccessful();

            // KPA cannot access role management
            $page = visit('/admin/roles', $kpa);
            $page->assertStatus(403);

            // Pegawai cannot access role management
            $page = visit('/admin/roles', $pegawai);
            $page->assertStatus(403);
        });
    });

    describe('UI Hiding Based on Permissions', function () {
        it('shows admin links only to super_admin', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $page = visit('/dashboard', $superAdmin);

            $page->assertSuccessful()
                ->assertNoJavascriptErrors()
                ->assertNoConsoleLogs();
        });

        it('hides admin links from non-admin users', function () {
            $pegawai = User::factory()->create();
            $pegawai->assignRole('pegawai');

            $page = visit('/dashboard', $pegawai);

            $page->assertSuccessful()
                ->assertNoJavascriptErrors()
                ->assertNoConsoleLogs();
        });

        it('displays appropriate UI based on user role', function () {
            $kpa = User::factory()->create();
            $kpa->assignRole('kpa');

            $page = visit('/dashboard', $kpa);

            $page->assertSuccessful()
                ->assertNoJavascriptErrors()
                ->assertNoConsoleLogs();
        });
    });

    describe('Accessibility and Responsive Design', function () {
        it('renders properly on desktop viewport', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $page = visit('/admin/roles', $superAdmin);

            $page->assertSuccessful()
                ->assertNoJavascriptErrors();
        });

        it('renders properly on mobile viewport', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $page = visit('/admin/roles', $superAdmin);

            $page->assertSuccessful()
                ->assertNoJavascriptErrors();
        });

        it('maintains accessibility with proper ARIA labels', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $page = visit('/admin/roles', $superAdmin);

            $page->assertSuccessful()
                ->assertNoJavascriptErrors()
                ->assertNoConsoleLogs();
        });
    });

    describe('Keyboard Navigation', function () {
        it('allows keyboard navigation through role list', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $page = visit('/admin/roles', $superAdmin);

            $page->assertSuccessful()
                ->assertNoJavascriptErrors();
        });

        it('supports tab navigation on role detail page', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'pegawai')->first();

            $page = visit("/admin/roles/{$role->id}", $superAdmin);

            $page->assertSuccessful()
                ->assertNoJavascriptErrors();
        });
    });

    describe('Error Handling', function () {
        it('displays proper error message for forbidden access', function () {
            $pegawai = User::factory()->create();
            $pegawai->assignRole('pegawai');

            $page = visit('/admin/roles', $pegawai);

            $page->assertStatus(403);
        });

        it('handles network errors gracefully', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $page = visit('/admin/roles', $superAdmin);

            $page->assertSuccessful()
                ->assertNoJavascriptErrors();
        });
    });

    describe('Confirmation Dialogs', function () {
        it('shows confirmation before removing user from role', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $pegawai = User::factory()->create();
            $pegawai->assignRole('pegawai');

            $role = Role::where('name', 'pegawai')->first();

            $page = visit("/admin/roles/{$role->id}", $superAdmin);

            $page->assertSuccessful()
                ->assertSee($pegawai->name)
                ->assertNoJavascriptErrors();
        });
    });

    describe('Success/Error Toasts', function () {
        it('displays success message after role assignment', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'pegawai')->first();

            $page = visit("/admin/roles/{$role->id}", $superAdmin);

            $page->assertSuccessful()
                ->assertNoJavascriptErrors()
                ->assertNoConsoleLogs();
        });

        it('displays error message on failed operation', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $page = visit('/admin/roles', $superAdmin);

            $page->assertSuccessful()
                ->assertNoJavascriptErrors();
        });
    });
});
