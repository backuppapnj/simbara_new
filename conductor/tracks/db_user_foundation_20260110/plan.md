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
- [x] Execute php artisan migrate [2a96c26]
- [x] Verify table structure [2a96c26]
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Database Migrations' (Protocol in workflow.md)

---

## Phase 2: Permission & Role Setup

### Task 2.1: Install Spatie Laravel Permission
- [x] Composer require spatie/laravel-permission [a550c99]
- [ ] Publish config and migrations
- [ ] Configure ServiceProvider

### Task 2.2: Create User model with HasRoles trait
- [x] Extend User model with HasRoles [5c03ab2]
- [ ] Add relationship methods
- [ ] Write unit tests for role assignment

### Task 2.3: Create custom Permission middleware
- [x] Create middleware for role/permission checks [2a96c26]
- [x] Register middleware in bootstrap/app.php [2a96c26]
- [x] Write unit tests for middleware [5c03ab2]

### Task 2.4: Task: Conductor - User Manual Verification 'Phase 2: Permission & Role Setup' (Protocol in workflow.md)

---

## Phase 3: Fortify Authentication

### Task 3.1: Configure Fortify features
- [x] Update config/fortify.php [5b9bf57]
- [x] Enable/disable appropriate features [5b9bf57]
- [x] Customize view routes if needed [5b9bf57]

### Task 3.2: Customize Fortify actions
- [x] Review CreateNewUser action [70c3272]
- [x] Add phone and nip fields to registration [70c3272]
- [x] Write unit tests for registration [b7764d0]

### Task 3.3: Test authentication flow
- [x] Test login functionality [b7764d0]
- [x] Test registration with new fields [b7764d0]
- [x] Test password reset [b7764d0]

### Task 3.4: Task: Conductor - User Manual Verification 'Phase 3: Fortify Authentication' (Protocol in workflow.md)

---

## Phase 4: Database Seeders

### Task 4.1: Create RolesSeeder
- [x] Create seeder for all 6 roles [2a96c26]
- [x] Write integration tests [2a96c26]

### Task 4.2: Create PermissionsSeeder
- [x] Define permissions for each module [2a96c26]
- [x] Assign permissions to roles [2a96c26]
- [x] Write integration tests [2a96c26]

### Task 4.3: Create LocationsSeeder and DepartmentsSeeder
- [x] Seed sample locations/ruangan [2a96c26]
- [x] Seed sample departments/unit kerja [2a96c26]
- [x] Write integration tests [2a96c26]

### Task 4.4: Create UsersSeeder
- [x] Create default super_admin user [70c3272]
- [x] Create sample users for each role [70c3272]
- [x] Write integration tests [b7764d0]

### Task 4.5: Task: Conductor - User Manual Verification 'Phase 4: Database Seeders' (Protocol in workflow.md)

---

## Phase 5: Final Integration Tests

### Task 5.1: Run full test suite
- [~] Execute php artisan test --compact
- [ ] Verify coverage >80%
- [ ] Fix any failing tests

### Task 5.2: Verify all components work together
- [ ] Test authentication with roles
- [ ] Test permission middleware
- [ ] Test database relationships

### Task 5.3: Task: Conductor - User Manual Verification 'Phase 5: Final Integration Tests' (Protocol in workflow.md)
