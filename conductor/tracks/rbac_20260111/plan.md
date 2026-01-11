# RBAC Management - Implementation Plan

## Phase 1: Permission Model & Database

### Task 1.1: Create Permission Model and Migration
- [ ] Write tests for Permission model (relationships, fillable, casts)
- [ ] Create Permission model (extend Spatie Permission)
- [ ] Write tests for migration (create permissions table, indexes)
- [ ] Create migration for permissions table with module, description fields
- [ ] Add foreign key constraints to model_has_permissions table
- [ ] Run migration and verify database schema

### Task 1.2: Create PermissionsSeeder
- [ ] Write tests for PermissionsSeeder
- [ ] Define all permissions array (assets.*, atk.*, office.*, users.*, roles.*, permissions.*, settings.*)
- [ ] Implement permission creation logic
- [ ] Write tests for default role-permission mapping
- [ ] Implement syncPermissions() logic for each role
- [ ] Test seeder creates ~50+ permissions
- [ ] Test seeder assigns correct permissions to each role

### Task 1.3: Create PermissionController
- [ ] Write tests for PermissionController index method
- [ ] Implement PermissionController index method (list all permissions grouped by module)
- [ ] Write tests for PermissionController store method (create permission)
- [ ] Implement PermissionController store method with validation
- [ ] Write tests for PermissionController update method
- [ ] Implement PermissionController update method
- [ ] Write tests for PermissionController destroy method
- [ ] Implement PermissionController destroy method
- [ ] Add return type hints and documentation

### Task 1.4: Create PermissionRequest Validation
- [ ] Write tests for StorePermissionRequest validation rules
- [ ] Create StorePermissionRequest with rules (name, module, description)
- [ ] Write tests for unique permission name validation
- [ ] Implement custom validation messages

### Task 1.5: Create API Routes
- [ ] Define routes for permission CRUD
- [ ] Add middleware for super_admin authorization
- [ ] Write tests for route protection
- [ ] Test 403 responses for non-super_admin

- [ ] **Task: Conductor - User Manual Verification 'Permission Model & Database'** (Protocol in workflow.md)

## Phase 2: Role-Permission Relationship

### Task 2.1: Create RolePermissionController
- [ ] Write tests for RolePermissionController index method (get permissions by role)
- [ ] Implement RolePermissionController index method
- [ ] Write tests for RolePermissionController update method (sync permissions to role)
- [ ] Implement RolePermissionController update method
- [ ] Write tests for bulk permission assignment
- [ ] Implement logic to sync multiple permissions to role
- [ ] Add return type hints and documentation

### Task 2.2: Create RolePermissionRequest Validation
- [ ] Write tests for SyncPermissionsRequest validation
- [ ] Create SyncPermissionsRequest with permission_ids array validation
- [ ] Write tests for exists validation (permissions must exist in database)
- [ ] Implement error messages for invalid permissions

### Task 2.3: Implement Business Logic
- [ ] Write tests for super_admin wildcard permission handling
- [ ] Implement logic: super_admin automatically gets all permissions
- [ ] Write tests for preventing duplicate permissions
- [ ] Implement deduplication logic
- [ ] Write tests for permission cleanup when role deleted
- [ ] Implement cascade delete logic

### Task 2.4: Update Role Management Routes
- [ ] Add routes for role-permission management
- [ ] Integrate with existing /admin/roles routes
- [ ] Write tests for route authorization
- [ ] Test 403 for non-super_admin

- [ ] **Task: Conductor - User Manual Verification 'Role-Permission Relationship'** (Protocol in workflow.md)

## Phase 3: Frontend - Permission Management UI

### Task 3.1: Update Role Detail Page with Tabs
- [ ] Write tests for RoleDetail component with tabs
- [ ] Update RoleDetail.tsx to support tab navigation (Users, Permissions)
- [ ] Implement tab state management
- [ ] Add TypeScript types for tab props
- [ ] Write tests for tab switching functionality

### Task 3.2: Create PermissionList Component
- [ ] Write tests for PermissionList component
- [ ] Create PermissionList.tsx component
- [ ] Implement permission display grouped by module
- [ ] Add accordion/collapse for each module
- [ ] Implement checkbox multi-select for permissions
- [ ] Add Select All/Deselect All per module
- [ ] Add search/filter permissions functionality
- [ ] Add TypeScript types for permission data

### Task 3.3: Create Permission CRUD Components
- [ ] Write tests for CreatePermissionModal component
- [ ] Create CreatePermissionModal.tsx (name, module, description)
- [ ] Implement form validation
- [ ] Write tests for EditPermissionModal component
- [ ] Create EditPermissionModal.tsx
- [ ] Write tests for DeletePermissionConfirmation component
- [ ] Create DeletePermissionConfirmation.tsx with warning
- [ ] Add TypeScript types and props interfaces

### Task 3.4: Create Permission Service Layer
- [ ] Write tests for permission API service functions
- [ ] Create permission service (getPermissions, createPermission, updatePermission, deletePermission)
- [ ] Create role-permission service (getRolePermissions, syncRolePermissions)
- [ ] Implement error handling
- [ ] Add TypeScript types for API responses

### Task 3.5: Update RoleManagement Page
- [ ] Update RoleManagement.tsx to support permission management
- [ ] Add navigation to permission management
- [ ] Implement permission count display per role
- [ ] Add loading states and error handling
- [ ] Add success/error toasts

- [ ] **Task: Conductor - User Manual Verification 'Frontend - Permission Management UI'** (Protocol in workflow.md)

## Phase 4: Authorization Implementation

### Task 4.1: Apply Permission Middleware to Routes
- [ ] Identify all routes needing permission protection
- [ ] Write tests for middleware application (assets routes)
- [ ] Apply permission middleware to all asset CRUD routes
- [ ] Write tests for middleware application (atk routes)
- [ ] Apply permission middleware to all ATK CRUD and approval routes
- [ ] Write tests for middleware application (office routes)
- [ ] Apply permission middleware to all office CRUD and approval routes
- [ ] Write tests for middleware application (users/roles routes)
- [ ] Apply permission middleware to user and role management routes
- [ ] Write tests for middleware application (settings routes)
- [ ] Apply permission middleware to settings routes
- [ ] Test 403 responses for unauthorized access

### Task 4.2: Create Policy Classes
- [ ] Write tests for AssetPolicy
- [ ] Create AssetPolicy with methods (view, create, update, delete, managePhotos, updateLocation, etc.)
- [ ] Implement permission check logic for each method
- [ ] Register AssetPolicy in AuthServiceProvider
- [ ] Write tests for AtkRequestPolicy
- [ ] Create AtkRequestPolicy with methods (create, approve, distribute, etc.)
- [ ] Register AtkRequestPolicy
- [ ] Write tests for other Policies (Item, OfficeSupply, StockOpname, etc.)
- [ ] Create remaining Policy classes as needed
- [ ] Register all Policies

### Task 4.3: Update Controllers to Use Policies
- [ ] Update AssetController to use AssetPolicy
- [ ] Replace authorization logic with policy calls
- [ ] Write tests for policy integration in AssetController
- [ ] Update AtkRequestController to use AtkRequestPolicy
- [ ] Update other controllers to use respective Policies
- [ ] Write tests for policy integration in other controllers

### Task 4.4: Implement Frontend Permission Directives
- [ ] Create usePermission composable/hook
- [ ] Implement can(permission) method
- [ ] Implement hasRole(role) method
- [ ] Write tests for permission composable
- [ ] Update components to use permission checks
- [ ] Hide/disable buttons based on permissions
- [ ] Add TypeScript types for permission utilities

- [ ] **Task: Conductor - User Manual Verification 'Authorization Implementation'** (Protocol in workflow.md)

## Phase 5: Integration, Testing & Polish

### Task 5.1: End-to-End Permission Testing
- [ ] Write E2E test for viewing permissions list
- [ ] Write E2E test for creating new permission
- [ ] Write E2E test for editing permission
- [ ] Write E2E test for deleting permission
- [ ] Write E2E test for assigning permissions to role
- [ ] Write E2E test for super_admin wildcard access
- [ ] Write E2E test for permission middleware blocking unauthorized access
- [ ] Write E2E test for policy-based authorization
- [ ] Write E2E test for UI hiding based on permissions

### Task 5.2: Performance Optimization
- [ ] Cache permission checks for super_admin
- [ ] Optimize permission queries (eager loading)
- [ ] Test performance with 100+ permissions
- [ ] Add database indexes if needed
- [ ] Implement permission cache invalidation on update

### Task 5.3: Security Testing
- [ ] Test permission bypass attempts
- [ ] Test SQL injection protection
- [ ] Test XSS protection in permission management
- [ ] Test CSRF protection
- [ ] Test that non-super_admin cannot access permission management

### Task 5.4: UI Polish & Documentation
- [ ] Add proper ARIA labels for permission checkboxes
- [ ] Add keyboard navigation support
- [ ] Test accessibility with screen reader
- [ ] Add confirmation dialogs for destructive actions
- [ ] Add success/error toasts for feedback
- [ ] Ensure responsive design for mobile
- [ ] Write documentation for permission structure
- [ ] Update README with RBAC guide

### Task 5.5: Code Quality
- [ ] Run ESLint and fix all issues
- [ ] Run Prettier for code formatting
- [ ] Run Laravel Pint for backend code
- [ ] Verify test coverage >80%
- [ ] Add inline documentation where needed
- [ ] Update type definitions

- [ ] **Task: Conductor - User Manual Verification 'Integration, Testing & Polish'** (Protocol in workflow.md)

## Quality Gates

Before marking this track complete:

- [ ] All tests pass (unit, integration, E2E)
- [ ] Code coverage >80%
- [ ] No ESLint/Prettier errors
- [ ] No Laravel Pint errors
- [ ] TypeScript types correct
- [ ] Mobile responsive
- [ ] Accessibility requirements met
- [ ] No security vulnerabilities
- [ ] All routes protected with permissions
- [ ] All policies registered and working
- [ ] Documentation complete

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
