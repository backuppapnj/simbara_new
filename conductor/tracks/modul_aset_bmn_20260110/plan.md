# Plan: Modul Aset (BMN)

## Phase 1: Database & Model Setup

### Task 1.1: Create Assets Migration
- [x] Create migration for assets table with all SIMAN fields
- [x] Add ULID primary key, foreign keys (locations, users)
- [x] Add soft deletes
- [x] Write unit tests for Asset model
- [x] Run migration and verify

### Task 1.2: Create AssetHistories Migration
- [x] Create migration for asset_histories table
- [x] Add foreign key relationships
- [x] Write unit tests for AssetHistory model
- [x] Run migration and verify

### Task 1.3: Create AssetMaintenances Migration
- [x] Create migration for asset_maintenances table
- [x] Write unit tests for AssetMaintenance model
- [x] Run migration and verify

### Task 1.4: Create AssetConditionLogs Migration
- [x] Create migration for asset_condition_logs table
- [x] Write unit tests for AssetConditionLog model
- [x] Run migration and verify

### Task 1.5: Create Asset Model with Relationships
- [x] Create Asset model with relationships (belongsTo Location, User)
- [x] Add hasMany relationships (histories, maintenances, conditionLogs)
- [x] Add casts for decimal fields, dates
- [x] Write tests for model relationships
- [x] Run `vendor/bin/pint --dirty`

### Task 1.6: Task: Conductor - User Manual Verification 'Phase 1: Database & Model Setup' (Protocol in workflow.md)

---

## Phase 2: Import Feature

### Task 2.1: Create Import Validation Rules
- [x] Create ImportAssetRequest with validation rules [4f9cd9a]
- [x] Validate JSON structure (metadata + data)
- [x] Validate required fields per record
- [x] Write tests for validation rules
- [x] Test error messages

### Task 2.2: Create Import Service
- [x] Create AssetImportService for processing JSON [4f9cd9a]
- [x] Implement chunk processing (100 records per batch)
- [x] Implement location mapping logic
- [x] Implement transaction handling per chunk
- [x] Write tests for import service
- [x] Test with sample data from docs/data_simplified.json

### Task 2.3: Create Import Controller & Route
- [x] Add GET /assets/import route [4f9cd9a]
- [x] Add POST /assets/import route [4f9cd9a]
- [x] Create AssetController->import() [4f9cd9a]
- [x] Create AssetController->processImport() [4f9cd9a]
- [x] Write tests for controllers
- [x] Test route access with permissions

### Task 2.4: Location Tracking (Partial Phase 4)
- [x] Add GET /assets/{id}/histories route [4f9cd9a]
- [x] Create AssetController->histories() [4f9cd9a]
- [x] Add POST /assets/{id}/update-location route [4f9cd9a]
- [x] Create AssetController->updateLocation() [4f9cd9a]
- [x] Auto-record location changes to asset_histories [4f9cd9a]
- [x] Write tests for location update and history

### Task 2.5: Create Import UI Components
- [x] Create Import.tsx page placeholder [4f9cd9a]
- [ ] Create file upload component with drag-drop
- [ ] Create preview component (show first 50 records)
- [ ] Create progress indicator
- [ ] Create error summary display
- [ ] Write tests for components
- [ ] Test file upload and preview

### Task 2.6: Task: Conductor - User Manual Verification 'Phase 2: Import Feature' (Protocol in workflow.md)

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
- [x] Create Show.tsx page [d16172b]
- [x] Display all SIMAN fields
- [x] Add back button
- [x] Add action buttons (Update Lokasi, Update Kondisi, Perawatan)
- [ ] Write integration tests
- [ ] Test page rendering

### Task 4.4: Task: Conductor - User Manual Verification 'Phase 4: Detail View' (Protocol in workflow.md)

---

## Phase 5: Photo Upload Feature (Enhancement)

### Task 5.1: Database & Model Setup
- [x] Create AssetPhotos migration with ULID, foreign keys [83a9e52]
- [x] Add fields: file_path, file_name, file_size, mime_type, caption, is_primary
- [x] Add soft deletes
- [x] Write unit tests for AssetPhoto model
- [x] Run migration and verify

### Task 5.2: Backend Implementation
- [x] Create AssetPhoto model with relationships [83a9e52]
- [x] Add photos() relationship to Asset model [83a9e52]
- [x] Create StoreAssetPhotoRequest validation [83a9e52]
- [x] Create UpdateAssetPhotoRequest validation [83a9e52]
- [x] Add photo upload routes to web.php [83a9e52]
- [x] Implement photosIndex() method [83a9e52]
- [x] Implement photosStore() method [83a9e52]
- [x] Implement photosUpdate() method [83a9e52]
- [x] Implement photosDestroy() method [83a9e52]
- [x] Write feature tests for all endpoints [83a9e52]
- [x] Run vendor/bin/pint --dirty

### Task 5.3: Frontend Components
- [x] Create AssetPhotoGallery component [f53ca3c]
- [x] Create AssetPhotoUpload component [f53ca3c]
- [x] Integrate CameraCapture for photo capture [f53ca3c]
- [x] Add photo preview and management [f53ca3c]
- [x] Create use-page-props hook [d16172b]
- [x] Update types with PageProps interface [d16172b]
- [x] Integrate photo gallery into Asset Show page [d16172b]
- [x] Test upload flow (file + camera)
- [x] Test photo management (view, delete, set primary)

### Task 5.4: Task: Conductor - User Manual Verification 'Phase 5: Photo Upload Feature' (Protocol in workflow.md)

---

## Phase 6: Update Features

### Task 6.1: Create Update Location Feature
- [x] Create UpdateLocationRequest validation
- [x] Add POST /assets/{id}/update-location route [4f9cd9a]
- [x] Create controller method [4f9cd9a]
- [x] Create AssetHistory record on update [4f9cd9a]
- [x] Write tests for update location
- [ ] Create UpdateLocationForm.tsx component
- [ ] Test location update flow

### Task 6.2: Create Update Condition Feature
- [ ] Create UpdateConditionRequest validation
- [ ] Add POST /assets/{id}/update-condition route
- [ ] Create controller method
- [ ] Create AssetConditionLog record on update
- [ ] Write tests for update condition
- [ ] Create UpdateConditionForm.tsx component
- [ ] Test condition update flow

### Task 6.3: Create Maintenance Feature
- [x] Create StoreMaintenanceRequest validation
- [x] Add POST /assets/{id}/maintenance route
- [x] Create controller method
- [x] Create AssetMaintenance record
- [x] Write tests for maintenance
- [ ] Create MaintenanceForm.tsx component
- [ ] Test maintenance creation flow

### Task 6.4: Create Assign Handler Feature
- [ ] Create AssignHandlerRequest validation
- [ ] Add POST /assets/{id}/assign-handler route
- [ ] Create controller method
- [ ] Update asset penanggung_jawab_id
- [ ] Write tests for assign handler
- [ ] Create AssignHandlerForm.tsx component
- [ ] Test handler assignment

### Task 6.5: Task: Conductor - User Manual Verification 'Phase 6: Update Features' (Protocol in workflow.md)

---

## Phase 7: History & Tracking Views

### Task 7.1: Create History Display
- [x] Add GET /assets/{id}/histories route [4f9cd9a]
- [x] Create controller method with pagination [4f9cd9a]
- [ ] Create history timeline component
- [ ] Display movement history
- [x] Write tests for history endpoint
- [ ] Test history display

### Task 7.2: Create Maintenance History Display
- [ ] Add GET /assets/{id}/maintenances route
- [ ] Create controller method with pagination
- [ ] Create maintenance list component
- [ ] Display maintenance history
- [ ] Write tests for maintenance history
- [ ] Test maintenance display

### Task 7.3: Add Tracking Tabs to Detail Page
- [ ] Add tabs to Show.tsx (Info, History, Maintenance)
- [ ] Implement tab switching
- [ ] Load data on tab switch
- [ ] Write tests for tabs
- [ ] Test tab navigation

### Task 7.4: Task: Conductor - User Manual Verification 'Phase 7: History & Tracking Views' (Protocol in workflow.md)

---

## Phase 8: Permissions & Access Control

### Task 8.1: Define Asset Permissions
- [ ] Define permissions in PermissionsSeeder
- [ ] Add: view_any_asset, view_asset, import_asset, update_asset_location, update_asset_condition, manage_asset_maintenance, assign_asset_handler
- [ ] Assign permissions to roles
- [ ] Write tests for permissions
- [ ] Run seeder and verify

### Task 8.2: Apply Permissions to Controllers
- [ ] Add permission checks to all controller methods
- [ ] Test permission access per role
- [ ] Write integration tests for permissions
- [ ] Test unauthorized access is blocked

### Task 8.3: Update UI Based on Permissions
- [ ] Hide/show features based on user permissions
- [ ] Disable actions for unauthorized users
- [ ] Write tests for permission-based UI
- [ ] Test UI per role

### Task 8.4: Task: Conductor - User Manual Verification 'Phase 8: Permissions & Access Control' (Protocol in workflow.md)

---

## Phase 9: Final Integration & Testing

### Task 9.1: Run Complete Test Suite
- [x] Execute `php artisan test --compact` - 589 tests passing
- [ ] Execute `npm run test` for frontend tests
- [x] Verify coverage >80%
- [ ] Fix any failing tests (pre-existing issues)
- [x] Run `vendor/bin/pint --dirty`

### Task 9.2: Browser Testing
- [ ] Test complete import flow
- [ ] Test list view on mobile and desktop
- [ ] Test detail view
- [ ] Test all update features
- [ ] Test photo upload flow
- [ ] Test permission-based access

### Task 9.3: Import with Real Data
- [ ] Test import with docs/data_simplified.json
- [ ] Verify all records imported correctly
- [ ] Verify location mapping works
- [ ] Check data integrity

### Task 9.4: Accessibility & Responsive Check
- [ ] Verify keyboard navigation
- [ ] Check ARIA labels
- [ ] Test on mobile viewport
- [ ] Test on tablet viewport
- [ ] Test on desktop viewport

### Task 9.5: Task: Conductor - User Manual Verification 'Phase 9: Final Integration & Testing' (Protocol in workflow.md)
