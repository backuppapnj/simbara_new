# Plan: Setup Database & User Management Foundation

## Phase 1: Database Migrations

### Task 1.1: Create users table migration
- [x] Create migration for enhanced users table with phone, nip, position, is_active [599d713]
- [x] Write unit tests for User model [599d713]

### Task 1.2: Create locations table migration
- [x] Create migration for locations/ruangan [2003693]
- [ ] Write unit tests for Location model

### Task 1.3: Create departments table migration
- [x] Create migration for departments/unit kerja [a550c99]
- [ ] Write unit tests for Department model

### Task 1.4: Run migrations and verify
- [ ] Execute php artisan migrate
- [ ] Verify table structure
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Database Migrations' (Protocol in workflow.md)

---

## Phase 2: Permission & Role Setup

### Task 2.1: Install Spatie Laravel Permission
- [x] Composer require spatie/laravel-permission [a550c99]
- [ ] Publish config and migrations
- [ ] Configure ServiceProvider

### Task 2.2: Create User model with HasRoles trait
- [ ] Extend User model with HasRoles
- [ ] Add relationship methods
- [ ] Write unit tests for role assignment

### Task 2.3: Create custom Permission middleware
- [ ] Create middleware for role/permission checks
- [ ] Register middleware in bootstrap/app.php
- [ ] Write unit tests for middleware

### Task 2.4: Task: Conductor - User Manual Verification 'Phase 2: Permission & Role Setup' (Protocol in workflow.md)

---

## Phase 3: Fortify Authentication

### Task 3.1: Configure Fortify features
- [ ] Update config/fortify.php
- [ ] Enable/disable appropriate features
- [ ] Customize view routes if needed

### Task 3.2: Customize Fortify actions
- [ ] Review CreateNewUser action
- [ ] Add phone and nip fields to registration
- [ ] Write unit tests for registration

### Task 3.3: Test authentication flow
- [ ] Test login functionality
- [ ] Test registration with new fields
- [ ] Test password reset

### Task 3.4: Task: Conductor - User Manual Verification 'Phase 3: Fortify Authentication' (Protocol in workflow.md)

---

## Phase 4: Database Seeders

### Task 4.1: Create RolesSeeder
- [ ] Create seeder for all 6 roles
- [ ] Write integration tests

### Task 4.2: Create PermissionsSeeder
- [ ] Define permissions for each module
- [ ] Assign permissions to roles
- [ ] Write integration tests

### Task 4.3: Create LocationsSeeder and DepartmentsSeeder
- [ ] Seed sample locations/ruangan
- [ ] Seed sample departments/unit kerja
- [ ] Write integration tests

### Task 4.4: Create UsersSeeder
- [ ] Create default super_admin user
- [ ] Create sample users for each role
- [ ] Write integration tests

### Task 4.5: Task: Conductor - User Manual Verification 'Phase 4: Database Seeders' (Protocol in workflow.md)

---

## Phase 5: Final Integration Tests

### Task 5.1: Run full test suite
- [ ] Execute php artisan test --compact
- [ ] Verify coverage >80%
- [ ] Fix any failing tests

### Task 5.2: Verify all components work together
- [ ] Test authentication with roles
- [ ] Test permission middleware
- [ ] Test database relationships

### Task 5.3: Task: Conductor - User Manual Verification 'Phase 5: Final Integration Tests' (Protocol in workflow.md)
