# Plan: Refinement RBAC dan Permissions Sistem

## Phase 1: Analysis & Documentation

- [ ] Task: Review current RBAC configuration
  - [ ] Subtask: Read and analyze PermissionsSeeder.php
  - [ ] Subtask: Read and analyze RolesSeeder.php
  - [ ] Subtask: Read and analyze UsersSeeder.php
  - [ ] Subtask: Document current permission assignments per role
- [ ] Task: Identify required permission changes
  - [ ] Subtask: List permissions to remove from kasubag_umum
  - [ ] Subtask: Verify super_admin has all system permissions
  - [ ] Subtask: Document permission changes for each role
- [ ] Task: Review test dependencies
  - [ ] Subtask: Identify tests that might be affected by permission changes
  - [ ] Subtask: List test files that use permissions
- [ ] Task: Conductor - User Manual Verification 'Analysis & Documentation' (Protocol in workflow.md)

## Phase 2: Update Permissions Configuration

- [x] Task: Update PermissionsSeeder.php
  - [x] Subtask: Remove `users.view` from kasubag_umum rolePermissions array
  - [x] Subtask: Remove `roles.manage` from kasubag_umum rolePermissions array
  - [x] Subtask: Remove `settings.whatsapp` from kasubag_umum rolePermissions array
  - [x] Subtask: Verify super_admin rolePermissions has `*` wildcard
  - [x] Subtask: Verify operator_persediaan permissions are correct
  - [x] Subtask: Verify operator_bmn permissions are correct
  - [x] Subtask: Verify kpa permissions are correct
  - [x] Subtask: Verify pegawai permissions are correct
- [ ] Task: Conductor - User Manual Verification 'Update Permissions Configuration' (Protocol in workflow.md)

## Phase 3: Update DatabaseSeeder

- [x] Task: Review DatabaseSeeder execution order
  - [x] Subtask: Verify RolesSeeder runs before PermissionsSeeder
  - [x] Subtask: Verify UsersSeeder runs after PermissionsSeeder
  - [x] Subtask: Ensure proper dependency order
- [x] Task: Update DatabaseSeeder if needed
  - [x] Subtask: Add comments explaining seeder execution order
  - [x] Subtask: Document dependencies between seeders
- [ ] Task: Conductor - User Manual Verification 'Update DatabaseSeeder' (Protocol in workflow.md)

## Phase 4: Test & Verification

- [x] Task: Run test suite
  - [x] Subtask: Run `php artisan test --compact` to verify all tests pass
  - [x] Subtask: Check for any 403 Forbidden errors related to permissions
  - [x] Subtask: Identify any failing tests
- [x] Task: Fix broken tests (if any)
  - [x] Subtask: Update tests that expect kasubag_umum to have removed permissions
  - [x] Subtask: Verify test users have correct permissions
  - [x] Subtask: Re-run tests until all pass
- [x] Task: Verify workflow approval
  - [x] Subtask: Test ATK request creation by pegawai
  - [x] Subtask: Test ATK approval Level 1 by operator_persediaan
  - [x] Subtask: Test ATK approval final by kpa
  - [x] Subtask: Verify kasubag_umum is NOT in approval chain
- [ ] Task: Conductor - User Manual Verification 'Test & Verification' (Protocol in workflow.md)

## Phase 5: Documentation Update

- [x] Task: Update RBAC documentation (if exists)
  - [x] Subtask: Check for RBAC documentation in docs/
  - [x] Subtask: Update permission matrix if exists
  - [x] Subtask: Update role descriptions
- [ ] Task: Conductor - User Manual Verification 'Documentation Update' (Protocol in workflow.md)

## Phase 6: Final Verification

- [x] Task: Final test run
  - [x] Subtask: Run full test suite `php artisan test --compact`
  - [x] Subtask: Verify all 1019+ tests pass
  - [x] Subtask: Run Pint for code formatting `vendor/bin/pint --dirty`
- [x] Task: Verify acceptance criteria
  - [x] Subtask: Confirm kasubag_umum does not have users.view, roles.manage, settings.whatsapp
  - [x] Subtask: Confirm super_admin is only role with system permissions
  - [x] Subtask: Confirm workflow approval 3-level works
  - [x] Subtask: Confirm all tests passing
- [ ] Task: Conductor - User Manual Verification 'Final Verification' (Protocol in workflow.md)
