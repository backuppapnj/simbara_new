# RBAC Management - Implementation Plan

## Phase 1: Permission Model & Database [checkpoint: 80952a9]

### Task 1.1: Create Permission Model and Migration
- [x] Write tests for Permission model (relationships, fillable, casts)
- [x] Create Permission model (extend Spatie Permission)
- [x] Write tests for migration (create permissions table, indexes)
- [x] Create migration for permissions table with module, description fields
- [x] Add foreign key constraints to model_has_permissions table
- [x] Run migration and verify database schema

### Task 1.2: Create PermissionsSeeder
- [x] Write tests for PermissionsSeeder
- [x] Define all permissions array (assets.*, atk.*, office.*, users.*, roles.*, permissions.*, settings.*)
- [x] Implement permission creation logic
- [x] Write tests for default role-permission mapping
- [x] Implement syncPermissions() logic for each role
- [x] Test seeder creates ~50+ permissions
- [x] Test seeder assigns correct permissions to each role

### Task 1.3: Create PermissionController
- [x] Write tests for PermissionController index method
- [x] Implement PermissionController index method (list all permissions grouped by module)
- [x] Write tests for PermissionController store method (create permission)
- [x] Implement PermissionController store method with validation
- [x] Write tests for PermissionController update method
- [x] Implement PermissionController update method
- [x] Write tests for PermissionController destroy method
- [x] Implement PermissionController destroy method
- [x] Add return type hints and documentation

### Task 1.4: Create PermissionRequest Validation
- [x] Write tests for StorePermissionRequest validation rules
- [x] Create StorePermissionRequest with rules (name, module, description)
- [x] Write tests for unique permission name validation
- [x] Implement custom validation messages

### Task 1.5: Create API Routes
- [x] Define routes for permission CRUD
- [x] Add middleware for super_admin authorization
- [x] Write tests for route protection
- [x] Test 403 responses for non-super_admin

- [x] **Task: Conductor - User Manual Verification 'Permission Model & Database'** (Protocol in workflow.md)

## Phase 2: Role-Permission Relationship [checkpoint: a236deb]

### Task 2.1: Update RoleController with Permission Methods
- [x] Write tests for RoleController permissions method (get permissions by role)
- [x] Implement RoleController permissions method
- [x] Write tests for RoleController syncPermissions method (sync permissions to role)
- [x] Implement RoleController syncPermissions method
- [x] Write tests for bulk permission assignment
- [x] Implement logic to sync multiple permissions to role
- [x] Add return type hints and documentation

### Task 2.2: Create StorePermissionRequest Validation
- [x] Write tests for StorePermissionRequest validation
- [x] Create StorePermissionRequest with rules (name, module, description)
- [x] Write tests for unique permission name validation
- [x] Implement custom validation messages

### Task 2.3: Implement Business Logic
- [x] Write tests for super_admin wildcard permission handling
- [x] Implement logic: super_admin automatically gets all permissions
- [x] Write tests for preventing duplicate permissions
- [x] Implement deduplication logic
- [x] Write tests for permission cleanup when role deleted
- [x] Implement cascade delete logic

### Task 2.4: Update Role Management Routes
- [x] Add routes for role-permission management
- [x] Integrate with existing /admin/roles routes
- [x] Write tests for route authorization
- [x] Test 403 for non-super_admin

- [x] **Task: Conductor - User Manual Verification 'Role-Permission Relationship'** (Protocol in workflow.md)

## Phase 3: Frontend - Permission Management UI [checkpoint: c9dbf1b]

### Task 3.1: Update Role Detail Page with Tabs
- [x] Write tests for RoleDetail component with tabs
- [x] Update RoleDetail.tsx to support tab navigation (Users, Permissions)
- [x] Implement tab state management
- [x] Add TypeScript types for tab props
- [x] Write tests for tab switching functionality

### Task 3.2: Create PermissionList Component
- [x] Write tests for PermissionList component
- [x] Create PermissionList.tsx component
- [x] Implement permission display grouped by module
- [x] Add accordion/collapse for each module
- [x] Implement checkbox multi-select for permissions
- [x] Add Select All/Deselect All per module
- [x] Add search/filter permissions functionality
- [x] Add TypeScript types for permission data

### Task 3.3: Create Permission CRUD Components
- [x] Write tests for CreatePermissionModal component
- [x] Create CreatePermissionModal.tsx (name, module, description)
- [x] Implement form validation
- [x] Write tests for EditPermissionModal component
- [x] Create EditPermissionModal.tsx
- [x] Write tests for DeletePermissionConfirmation component
- [x] Create DeletePermissionConfirmation.tsx with warning
- [x] Add TypeScript types and props interfaces

### Task 3.4: Create Permission Service Layer
- [x] Write tests for permission API service functions
- [x] Create permission service (getPermissions, createPermission, updatePermission, deletePermission)
- [x] Create role-permission service (getRolePermissions, syncRolePermissions)
- [x] Implement error handling
- [x] Add TypeScript types for API responses

### Task 3.5: Update RoleManagement Page
- [x] Update RoleManagement.tsx to support permission management
- [x] Add navigation to permission management
- [x] Implement permission count display per role
- [x] Add loading states and error handling
- [x] Add success/error toasts

- [x] **Task: Conductor - User Manual Verification 'Frontend - Permission Management UI'** (Protocol in workflow.md)

## Phase 4: Authorization Implementation [checkpoint: 2f3678a]

### Task 4.1: Apply Permission Middleware to Routes
- [x] Identify all routes needing permission protection
- [x] Write tests for middleware application (assets routes)
- [x] Apply permission middleware to all asset CRUD routes
- [x] Write tests for middleware application (atk routes)
- [x] Apply permission middleware to all ATK CRUD and approval routes
- [x] Write tests for middleware application (office routes)
- [x] Apply permission middleware to all office CRUD and approval routes
- [x] Write tests for middleware application (users/roles routes)
- [x] Apply permission middleware to user and role management routes
- [x] Write tests for middleware application (settings routes)
- [x] Apply permission middleware to settings routes
- [x] Test 403 responses for unauthorized access

### Task 4.2: Create Policy Classes
- [x] Write tests for AssetPolicy
- [x] Create AssetPolicy with methods (view, create, update, delete, managePhotos, updateLocation, etc.)
- [x] Implement permission check logic for each method
- [x] Register AssetPolicy in AuthServiceProvider
- [x] Write tests for AtkRequestPolicy
- [x] Create AtkRequestPolicy with methods (create, approve, distribute, etc.)
- [x] Register AtkRequestPolicy
- [x] Write tests for other Policies (Item, OfficeSupply, StockOpname, etc.)
- [x] Create remaining Policy classes as needed
- [x] Register all Policies

### Task 4.3: Update Controllers to Use Policies
- [x] Update AssetController to use AssetPolicy
- [x] Replace authorization logic with policy calls
- [x] Write tests for policy integration in AssetController
- [x] Update AtkRequestController to use AtkRequestPolicy
- [x] Update other controllers to use respective Policies
- [x] Write tests for policy integration in other controllers

### Task 4.4: Implement Frontend Permission Directives
- [x] Create usePermission composable/hook
- [x] Implement can(permission) method
- [x] Implement hasRole(role) method
- [x] Write tests for permission composable
- [x] Update components to use permission checks
- [x] Hide/disable buttons based on permissions
- [x] Add TypeScript types for permission utilities

- [x] **Task: Conductor - User Manual Verification 'Authorization Implementation'** (Protocol in workflow.md)

## Phase 5: Integration, Testing & Polish [checkpoint: 5534bc7]

### Task 5.1: End-to-End Permission Testing
- [x] Write E2E test for viewing permissions list
- [x] Write E2E test for creating new permission
- [x] Write E2E test for editing permission
- [x] Write E2E test for deleting permission
- [x] Write E2E test for assigning permissions to role
- [x] Write E2E test for super_admin wildcard access
- [x] Write E2E test for permission middleware blocking unauthorized access
- [x] Write E2E test for policy-based authorization
- [x] Write E2E test for UI hiding based on permissions

### Task 5.2: Performance Optimization
- [x] Cache permission checks for super_admin
- [x] Optimize permission queries (eager loading)
- [x] Test performance with 100+ permissions
- [x] Add database indexes if needed
- [x] Implement permission cache invalidation on update

### Task 5.3: Security Testing
- [x] Test permission bypass attempts
- [x] Test SQL injection protection
- [x] Test XSS protection in permission management
- [x] Test CSRF protection
- [x] Test that non-super_admin cannot access permission management

### Task 5.4: UI Polish & Documentation
- [x] Add proper ARIA labels for permission checkboxes
- [x] Add keyboard navigation support
- [x] Test accessibility with screen reader
- [x] Add confirmation dialogs for destructive actions
- [x] Add success/error toasts for feedback
- [x] Ensure responsive design for mobile
- [x] Write documentation for permission structure
- [x] Update README with RBAC guide

### Task 5.5: Code Quality
- [x] Run ESLint and fix all issues
- [x] Run Prettier for code formatting
- [x] Run Laravel Pint for backend code
- [x] Verify test coverage >80%
- [x] Add inline documentation where needed
- [x] Update type definitions

- [x] **Task: Conductor - User Manual Verification 'Integration, Testing & Polish'** (Protocol in workflow.md)

## Quality Gates

Before marking this track complete:

- [x] All tests pass (unit, integration, E2E)
- [x] Code coverage >80%
- [x] No ESLint/Prettier errors
- [x] No Laravel Pint errors
- [x] TypeScript types correct
- [x] Mobile responsive
- [x] Accessibility requirements met
- [x] No security vulnerabilities
- [x] All routes protected with permissions
- [x] All policies registered and working
- [x] Documentation complete

## Definition of Done

This track is complete when:

1. ~50+ permissions created and seeded
2. All roles have correct default permissions
3. Super Admin can CRUD permissions via UI
4. Super Admin can assign permissions to roles via UI
5. All routes protected with permission middleware
6. All models use Policy classes
7. Frontend components use permission checks
8. All acceptance criteria met
9. All tests passing with >80% coverage
10. Mobile responsive and accessible
11. Code committed with proper messages
12. Git notes attached for each task
13. Phase checkpoints created
