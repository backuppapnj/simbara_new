# Plan: Modul Aset (BMN)

## Phase 1: Database & Model Setup

### Task 1.1: Create Assets Migration
- [~] Create migration for assets table with all SIMAN fields
- [~] Add ULID primary key, foreign keys (locations, users)
- [~] Add soft deletes
- [~] Write unit tests for Asset model
- [ ] Run migration and verify

### Task 1.2: Create AssetHistories Migration
- [ ] Create migration for asset_histories table
- [ ] Add foreign key relationships
- [ ] Write unit tests for AssetHistory model
- [ ] Run migration and verify

### Task 1.3: Create AssetMaintenances Migration
- [ ] Create migration for asset_maintenances table
- [ ] Write unit tests for AssetMaintenance model
- [ ] Run migration and verify

### Task 1.4: Create AssetConditionLogs Migration
- [ ] Create migration for asset_condition_logs table
- [ ] Write unit tests for AssetConditionLog model
- [ ] Run migration and verify

### Task 1.5: Create Asset Model with Relationships
- [ ] Create Asset model with relationships (belongsTo Location, User)
- [ ] Add hasMany relationships (histories, maintenances, conditionLogs)
- [ ] Add casts for decimal fields, dates
- [ ] Write tests for model relationships
- [ ] Run `vendor/bin/pint --dirty`

### Task 1.6: Task: Conductor - User Manual Verification 'Phase 1: Database & Model Setup' (Protocol in workflow.md)

---

## Phase 2: Import Feature

### Task 2.1: Create Import Validation Rules
- [ ] Create ImportAssetRequest with validation rules
- [ ] Validate JSON structure (metadata + data)
- [ ] Validate required fields per record
- [ ] Write tests for validation rules
- [ ] Test error messages

### Task 2.2: Create Import Service
- [ ] Create AssetImportService for processing JSON
- [ ] Implement chunk processing (100 records per batch)
- [ ] Implement location mapping logic
- [ ] Implement transaction handling per chunk
- [ ] Write tests for import service
- [ ] Test with sample data from docs/data_simplified.json

### Task 2.3: Create Import Controller & Route
- [ ] Add GET /assets/import route
- [ ] Add POST /assets/import route
- [ ] Create AssetController->import()
- [ ] Create AssetController->processImport()
- [ ] Write tests for controllers
- [ ] Test route access with permissions

### Task 2.4: Create Import UI Components
- [ ] Create Import.tsx page
- [ ] Create file upload component with drag-drop
- [ ] Create preview component (show first 50 records)
- [ ] Create progress indicator
- [ ] Create error summary display
- [ ] Write tests for components
- [ ] Test file upload and preview

### Task 2.5: Task: Conductor - User Manual Verification 'Phase 2: Import Feature' (Protocol in workflow.md)

---

## Phase 3: List View & Display

### Task 3.1: Create Assets Index Route & Controller
- [ ] Add GET /assets route with auth middleware
- [ ] Create AssetController->index()
- [ ] Implement search by nama/kode
- [ ] Implement filter by lokasi/kondisi/status
- [ ] Implement pagination (50 per page)
- [ ] Write tests for index endpoint

### Task 3.2: Create Asset Table Component
- [ ] Create AssetTable.tsx with shadcn/table
- [ ] Implement columns: Kode, Nama, Lokasi, Kondisi, Nilai
- [ ] Add sortable columns
- [ ] Add row actions (view detail)
- [ ] Write tests for table component
- [ ] Test sorting and row actions

### Task 3.3: Create Asset Card Component
- [ ] Create AssetCard.tsx with shadcn/card
- [ ] Display key info in card format
- [ ] Add tap action to view detail
- [ ] Write tests for card component
- [ ] Test responsive behavior

### Task 3.4: Create Assets Index Page
- [ ] Create Index.tsx page with search/filter
- [ ] Implement responsive table/card switch
- [ ] Add pagination component
- [ ] Test loading states with skeletons
- [ ] Write integration tests
- [ ] Test on mobile and desktop

### Task 3.5: Task: Conductor - User Manual Verification 'Phase 3: List View & Display' (Protocol in workflow.md)

---

## Phase 4: Detail View

### Task 4.1: Create Asset Detail Route & Controller
- [ ] Add GET /assets/{id} route
- [ ] Create AssetController->show()
- [ ] Load asset with relationships
- [ ] Write tests for show endpoint
- [ ] Test with valid and invalid IDs

### Task 4.2: Create Asset Detail Components
- [ ] Create AssetDetail.tsx with full asset info
- [ ] Create AssetSummary.tsx for key info display
- [ ] Add formatted values (Rupiah, dates)
- [ ] Write tests for components
- [ ] Test data formatting

### Task 4.3: Create Show Page
- [ ] Create Show.tsx page
- [ ] Display all SIMAN fields
- [ ] Add back button
- [ ] Add action buttons (Update Lokasi, Update Kondisi, Perawatan)
- [ ] Write integration tests
- [ ] Test page rendering

### Task 4.4: Task: Conductor - User Manual Verification 'Phase 4: Detail View' (Protocol in workflow.md)

---

## Phase 5: Update Features

### Task 5.1: Create Update Location Feature
- [ ] Create UpdateLocationRequest validation
- [ ] Add POST /assets/{id}/update-location route
- [ ] Create controller method
- [ ] Create AssetHistory record on update
- [ ] Write tests for update location
- [ ] Create UpdateLocationForm.tsx component
- [ ] Test location update flow

### Task 5.2: Create Update Condition Feature
- [ ] Create UpdateConditionRequest validation
- [ ] Add POST /assets/{id}/update-condition route
- [ ] Create controller method
- [ ] Create AssetConditionLog record on update
- [ ] Write tests for update condition
- [ ] Create UpdateConditionForm.tsx component
- [ ] Test condition update flow

### Task 5.3: Create Maintenance Feature
- [ ] Create StoreMaintenanceRequest validation
- [ ] Add POST /assets/{id}/maintenance route
- [ ] Create controller method
- [ ] Create AssetMaintenance record
- [ ] Write tests for maintenance
- [ ] Create MaintenanceForm.tsx component
- [ ] Test maintenance creation flow

### Task 5.4: Create Assign Handler Feature
- [ ] Create AssignHandlerRequest validation
- [ ] Add POST /assets/{id}/assign-handler route
- [ ] Create controller method
- [ ] Update asset penanggung_jawab_id
- [ ] Write tests for assign handler
- [ ] Create AssignHandlerForm.tsx component
- [ ] Test handler assignment

### Task 5.5: Task: Conductor - User Manual Verification 'Phase 5: Update Features' (Protocol in workflow.md)

---

## Phase 6: History & Tracking Views

### Task 6.1: Create History Display
- [ ] Add GET /assets/{id}/histories route
- [ ] Create controller method with pagination
- [ ] Create history timeline component
- [ ] Display movement history
- [ ] Write tests for history endpoint
- [ ] Test history display

### Task 6.2: Create Maintenance History Display
- [ ] Add GET /assets/{id}/maintenances route
- [ ] Create controller method with pagination
- [ ] Create maintenance list component
- [ ] Display maintenance history
- [ ] Write tests for maintenance history
- [ ] Test maintenance display

### Task 6.3: Add Tracking Tabs to Detail Page
- [ ] Add tabs to Show.tsx (Info, History, Maintenance)
- [ ] Implement tab switching
- [ ] Load data on tab switch
- [ ] Write tests for tabs
- [ ] Test tab navigation

### Task 6.4: Task: Conductor - User Manual Verification 'Phase 6: History & Tracking Views' (Protocol in workflow.md)

---

## Phase 7: Permissions & Access Control

### Task 7.1: Define Asset Permissions
- [ ] Define permissions in PermissionsSeeder
- [ ] Add: view_any_asset, view_asset, import_asset, update_asset_location, update_asset_condition, manage_asset_maintenance, assign_asset_handler
- [ ] Assign permissions to roles
- [ ] Write tests for permissions
- [ ] Run seeder and verify

### Task 7.2: Apply Permissions to Controllers
- [ ] Add permission checks to all controller methods
- [ ] Test permission access per role
- [ ] Write integration tests for permissions
- [ ] Test unauthorized access is blocked

### Task 7.3: Update UI Based on Permissions
- [ ] Hide/show features based on user permissions
- [ ] Disable actions for unauthorized users
- [ ] Write tests for permission-based UI
- [ ] Test UI per role

### Task 7.4: Task: Conductor - User Manual Verification 'Phase 7: Permissions & Access Control' (Protocol in workflow.md)

---

## Phase 8: Final Integration & Testing

### Task 8.1: Run Complete Test Suite
- [ ] Execute `php artisan test --compact`
- [ ] Execute `npm run test` for frontend tests
- [ ] Verify coverage >80%
- [ ] Fix any failing tests
- [ ] Run `vendor/bin/pint --dirty`

### Task 8.2: Browser Testing
- [ ] Test complete import flow
- [ ] Test list view on mobile and desktop
- [ ] Test detail view
- [ ] Test all update features
- [ ] Test permission-based access

### Task 8.3: Import with Real Data
- [ ] Test import with docs/data_simplified.json
- [ ] Verify all records imported correctly
- [ ] Verify location mapping works
- [ ] Check data integrity

### Task 8.4: Accessibility & Responsive Check
- [ ] Verify keyboard navigation
- [ ] Check ARIA labels
- [ ] Test on mobile viewport
- [ ] Test on tablet viewport
- [ ] Test on desktop viewport

### Task 8.5: Task: Conductor - User Manual Verification 'Phase 8: Final Integration & Testing' (Protocol in workflow.md)
