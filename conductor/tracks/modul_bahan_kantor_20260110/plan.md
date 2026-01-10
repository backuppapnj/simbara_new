# Plan: Modul Bahan Keperluan Kantor

## Phase 1: Database & Model Setup

### Task 1.1: Create OfficeSupplies Migration
- [x] Create migration for office_supplies table
- [x] Create migration for office_mutations table
- [x] Add ULID primary keys, soft deletes
- [x] Write unit tests for OfficeSupply model
- [x] Write unit tests for OfficeMutation model
- [x] Run migrations and verify

### Task 1.2: Create Purchase Migrations
- [x] Create migration for office_purchases table
- [x] Create migration for office_purchase_details table
- [x] Add foreign key relationships
- [x] Write unit tests for OfficePurchase and OfficePurchaseDetail models
- [x] Run migrations and verify

### Task 1.3: Create Request Migrations
- [x] Create migration for office_requests table
- [x] Create migration for office_request_details table
- [x] Add approval fields (direct approval only)
- [x] Write unit tests for OfficeRequest and OfficeRequestDetail models
- [x] Run migrations and verify

### Task 1.4: Create Usage Migration
- [x] Create migration for office_usages table
- [x] Write unit tests for OfficeUsage model
- [x] Run migrations and verify

### Task 1.5: Create Model Relationships
- [x] Define OfficeSupply relationships (hasMany mutations, requestDetails, usages)
- [x] Define OfficePurchase relationships (hasMany details)
- [x] Define OfficeRequest relationships (hasMany details, user, department)
- [x] Define OfficeMutation relationships (belongsTo supply, user)
- [x] Define OfficeUsage relationships (belongsTo supply, user)
- [x] Write tests for all relationships
- [x] Run `vendor/bin/pint --dirty`

### Task 1.6: Task: Conductor - User Manual Verification 'Phase 1: Database & Model Setup' (Protocol in workflow.md)

---

## Phase 2: Master Data Bahan Kantor

### Task 2.1: Create OfficeSupplies CRUD
- [ ] Create OfficeSupplyController with CRUD methods
- [ ] Add routes: GET /office-supplies, POST /office-supplies, PUT /office-supplies/{id}
- [ ] Create validation rules (OfficeSupplyRequest)
- [ ] Write tests for CRUD operations
- [ ] Test permissions per role

### Task 2.2: Create OfficeSupplies UI Components
- [ ] Create Index.tsx with table view
- [ ] Create Create.tsx form
- [ ] Create Show.tsx detail view
- [ ] Add reorder point indicator (badge warning)
- [ ] Filter by kategori
- [ ] Write tests for components
- [ ] Test responsive behavior

### Task 2.3: Create Mutations List View
- [ ] Add GET /office-supplies/{id}/mutations route
- [ ] Create controller method with pagination
- [ ] Create mutations list component (sederhana)
- [ ] Show: tanggal, jenis, jumlah, tipe, keterangan
- [ ] Filter by jenis mutasi and date range
- [ ] Write tests for mutations view
- [ ] Test list display

### Task 2.4: Task: Conductor - User Manual Verification 'Phase 2: Master Data Bahan Kantor' (Protocol in workflow.md)

---

## Phase 3: Workflow Pembelian (Direct Update)

### Task 3.1: Create Pembelian Form
- [ ] Create purchase form component
- [ ] Add dynamic supply rows (supply, jumlah)
- [ ] Create POST /office-purchases route
- [ ] Save OfficePurchase + OfficePurchaseDetails
- [ ] Auto-create OfficeMutations (jenis: masuk)
- [ ] Auto-update stok in OfficeSupplies
- [ ] Write tests for purchase creation
- [ ] Test stok update logic

### Task 3.2: Create Purchase List & Detail Views
- [ ] Create Index.tsx with purchase list
- [ ] Filter by date range
- [ ] Create Show.tsx with purchase details
- [ ] Show items purchased
- [ ] Write tests for views
- [ ] Test data display

### Task 3.3: Task: Conductor - User Manual Verification 'Phase 3: Workflow Pembelian' (Protocol in workflow.md)

---

## Phase 4: Permintaan & Direct Approval

### Task 4.1: Create Permintaan Form
- [ ] Create request form for Pegawai
- [ ] Add dynamic supply rows
- [ ] Validate stok tersedia (warning only)
- [ ] Create POST /office-requests route
- [ ] Save OfficeRequest + OfficeRequestDetails
- [ ] Set initial status to 'pending'
- [ ] Write tests for request creation
- [ ] Test form submission

### Task 4.2: Create Direct Approval System
- [ ] Create approval component
- [ ] Add POST /office-requests/{id}/approve route
- [ ] Add POST /office-requests/{id}/reject route
- [ ] Implement approval logic (Operator only)
- [ ] On approve: auto-distribute & create mutations keluar
- [ ] Update stok
- [ ] Write tests for approval and rejection
- [ ] Test stok reduction on approval

### Task 4.3: Create Request List & Views
- [ ] Create Index.tsx with request list
- [ ] Filter by status and user
- [ ] Create Show.tsx with request details
- [ ] Add action buttons (approve/reject) for Operator
- [ ] Show status timeline (pending → approved → completed)
- [ ] Write tests for views
- [ ] Test permission-based UI

### Task 4.4: Task: Conductor - User Manual Verification 'Phase 4: Permintaan & Direct Approval' (Protocol in workflow.md)

---

## Phase 5: Pencatatan Pemakaian

### Task 5.1: Create Manual Usage Input
- [ ] Create usage form component
- [ ] Input: supply, jumlah, tanggal, keperluan
- [ ] Create POST /office-usages route
- [ ] Save OfficeUsage
- [ ] Create OfficeMutation (jenis: keluar, tipe: manual)
- [ ] Update stok
- [ ] Write tests for manual usage
- [ ] Test stok update

### Task 5.2: Create Quick Deduct Feature
- [ ] Create quick deduct form (minimal)
- [ ] Input: supply, jumlah, keterangan singkat
- [ ] Create POST /office-mutations/quick-deduct route
- [ ] Create OfficeMutation langsung (jenis: keluar, tipe: quick_deduct)
- [ ] Update stok
- [ ] Write tests for quick deduct
- [ ] Test quick stok reduction

### Task 5.3: Create Usage List View
- [ ] Create Index.tsx with usage list
- [ ] Filter by date range and user
- [ ] Show usage history
- [ ] Write tests for view
- [ ] Test list display

### Task 5.4: Task: Conductor - User Manual Verification 'Phase 5: Pencatatan Pemakaian' (Protocol in workflow.md)

---

## Phase 6: Laporan

### Task 6.1: Create Laporan Mutasi Stok
- [ ] Add GET /office-reports/mutations route
- [ ] Filter by date range
- [ ] Query all mutations
- [ ] Calculate summary (total masuk, total keluar)
- [ ] Create Mutations.tsx page
- [ ] Write tests for report query
- [ ] Test report accuracy

### Task 6.2: Create Laporan Pemakaian per Unit
- [ ] Add GET /office-reports/usage-by-unit route
- [ ] Filter by periode (bulan/tahun)
- [ ] Group by department
- [ ] Calculate total usage per unit
- [ ] Create UsageByUnit.tsx page
- [ ] Write tests for report
- [ ] Test grouping logic

### Task 6.3: Create Laporan Pembelian
- [ ] Add GET /office-reports/purchases route
- [ ] Filter by periode (bulan/tahun)
- [ ] Query all purchases
- [ ] Calculate total pengeluaran
- [ ] Create Purchases.tsx page
- [ ] Write tests for report
- [ ] Test calculation

### Task 6.4: Create Report Exports
- [ ] Add GET /office-reports/{type}/pdf route
- [ ] Add GET /office-reports/{type}/excel route
- [ ] Generate PDF for each report type
- [ ] Generate Excel for each report type
- [ ] Write tests for exports
- [ ] Test file downloads

### Task 6.5: Task: Conductor - User Manual Verification 'Phase 6: Laporan' (Protocol in workflow.md)

---

## Phase 7: Permissions & UI

### Task 7.1: Define Office Permissions
- [ ] Define permissions in PermissionsSeeder
- [ ] Add: manage_office_supplies, manage_office_purchases, create_office_request, approve_office_request, manage_office_usages, view_office_reports
- [ ] Assign permissions to roles
- [ ] Write tests for permissions
- [ ] Run seeder and verify

### Task 7.2: Apply Permissions to Controllers
- [ ] Add permission checks to all controllers
- [ ] Test permission access per role
- [ ] Write integration tests for permissions
- [ ] Test unauthorized access is blocked

### Task 7.3: Update UI Based on Permissions
- [ ] Hide/show features based on user permissions
- [ ] Disable actions for unauthorized users
- [ ] Write tests for permission-based UI
- [ ] Test UI per role

### Task 7.4: Add Dashboard Widgets for Office Supplies
- [ ] Create summary cards:
  - Total items
  - Items below reorder point
  - Pending requests
- [ ] Show in main dashboard
- [ ] Write tests for widgets
- [ ] Test dashboard integration

### Task 7.5: Task: Conductor - User Manual Verification 'Phase 7: Permissions & UI' (Protocol in workflow.md)

---

## Phase 8: Final Integration & Testing

### Task 8.1: Run Complete Test Suite
- [ ] Execute `php artisan test --compact`
- [ ] Execute `npm run test` for frontend tests
- [ ] Verify coverage >80%
- [ ] Fix any failing tests
- [ ] Run `vendor/bin/pint --dirty`

### Task 8.2: End-to-End Workflow Testing
- [ ] Test complete pembelian flow
- [ ] Test complete permintaan & approval flow
- [ ] Test manual usage input
- [ ] Test quick deduct
- [ ] Verify stok updates correctly in all scenarios

### Task 8.3: Browser Testing
- [ ] Test all pages on mobile
- [ ] Test all pages on tablet
- [ ] Test all pages on desktop
- [ ] Verify responsive layouts
- [ ] Test all forms and submissions

### Task 8.4: Data Integrity Testing
- [ ] Verify stok calculations are correct
- [ ] Verify mutation records are accurate
- [ ] Test concurrent operations
- [ ] Verify soft deletes work correctly
- [ ] Test report accuracy

### Task 8.5: Task: Conductor - User Manual Verification 'Phase 8: Final Integration & Testing' (Protocol in workflow.md)
