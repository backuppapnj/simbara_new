# Plan: Modul Persediaan ATK

## Phase 1: Database & Model Setup

### Task 1.1: Create Master Data Migrations
- [x] Create migration for items table
- [x] Create migration for stock_mutations table
- [x] Add ULID primary keys, soft deletes
- [x] Write unit tests for Item model
- [x] Write unit tests for StockMutation model
- [x] Run migrations and verify

### Task 1.2: Create Purchase Migrations
- [x] Create migration for purchases table
- [x] Create migration for purchase_details table
- [x] Add foreign key relationships
- [x] Write unit tests for Purchase and PurchaseDetail models
- [x] Run migrations and verify

### Task 1.3: Create Request Migrations
- [x] Create migration for requests table
- [x] Create migration for request_details table
- [x] Add approval fields (level1, level2, level3)
- [x] Write unit tests for Request and RequestDetail models
- [x] Run migrations and verify

### Task 1.4: Create Stock Opname Migrations
- [x] Create migration for stock_opnames table
- [x] Create migration for stock_opname_details table
- [x] Write unit tests for StockOpname and StockOpnameDetail models
- [x] Run migrations and verify

### Task 1.5: Create Model Relationships
- [x] Define Item relationships (hasMany mutations, requestDetails, etc.)
- [x] Define Purchase relationships (hasMany details, items)
- [x] Define Request relationships (hasMany details, user, department)
- [x] Define StockMutation relationships (belongsTo item)
- [x] Write tests for all relationships
- [x] Run `vendor/bin/pint --dirty`

### Task 1.6: Task: Conductor - User Manual Verification 'Phase 1: Database & Model Setup' (Protocol in workflow.md)

---

## Phase 2: Master Data ATK

### Task 2.1: Create Items CRUD
- [x] Create ItemController with CRUD methods
- [x] Add routes: GET /items, POST /items, PUT /items/{id}
- [x] Create validation rules (ItemRequest)
- [x] Write tests for CRUD operations
- [x] Test permissions per role

### Task 2.2: Create Items UI Components
- [x] Create Index.tsx with table view
- [ ] Create Create.tsx form
- [ ] Create Show.tsx detail view
- [ ] Add reorder point indicator (badge)
- [ ] Write tests for components
- [ ] Test responsive behavior

### Task 2.3: Create Kartu Stok View
- [x] Add GET /items/{id}/mutations route
- [x] Create controller method with pagination
- [x] Create mutations list component
- [x] Show running balance (stok sesudah)
- [x] Filter by jenis mutasi and date range
- [x] Write tests for kartu stok
- [x] Test real-time updates

### Task 2.4: Task: Conductor - User Manual Verification 'Phase 2: Master Data ATK' (Protocol in workflow.md)

---

## Phase 3: Workflow Pengadaan (3-Step)

### Task 3.1: Create Input Pembelian
- [x] Create StorePurchaseRequest validation
- [x] Create POST /purchases route
- [x] Save Purchase + PurchaseDetails
- [x] Calculate total nilai from items
- [x] Auto-generate PO number (PB-YYYYMMDD-XXXX)
- [x] Write tests for purchase creation
- [x] Test form validation

### Task 3.2: Create Penerimaan Barang
- [x] Create ReceivePurchaseRequest validation
- [x] Create POST /purchases/{id}/receive route
- [x] Update status to 'received'
- [x] Add jumlah_diterima field to track received quantities
- [x] Validate jumlah_diterima does not exceed jumlah
- [x] Write tests for receiving process

### Task 3.3: Create Update Stok Process
- [x] Create POST /purchases/{id}/complete route
- [x] Create StockMutations for each item (jenis: masuk)
- [x] Update item stok
- [x] Update harga rata-rata (weighted average)
- [x] Update harga_beli_terakhir
- [x] Use jumlah_diterima if available, otherwise use jumlah
- [x] Wrap in database transaction for data integrity
- [x] Write tests for stok update

### Task 3.4: Create Purchase List & Detail Views
- [x] Create GET /purchases route (index with status filter)
- [x] Create GET /purchases/{id} route (show purchase details)
- [x] Add Inertia pages (Index.tsx, Show.tsx)
- [x] Load purchaseDetails with item relationships

### Task 3.5: Task: Conductor - User Manual Verification 'Phase 3: Workflow Pengadaan' (Protocol in workflow.md)

---

## Phase 4: Permintaan & Approval Workflow

### Task 4.1: Create Permintaan Form
- [x] Create request form for Pegawai
- [x] Add dynamic item rows
- [x] Validate stok tersedia (warning only)
- [x] Create POST /requests route
- [x] Save Request + RequestDetails
- [x] Set initial status to 'pending'
- [x] Write tests for request creation
- [x] Test form submission

### Task 4.2: Create Approval System
- [x] Create approval component
- [x] Add POST /requests/{id}/approve-level1
- [x] Add POST /requests/{id}/approve-level2
- [x] Add POST /requests/{id}/approve-level3
- [x] Add POST /requests/{id}/reject
- [x] Implement approval logic with role checks
- [x] Write tests for each approval level
- [x] Test approval workflow

### Task 4.3: Create Request List & Views
- [ ] Create Index.tsx with request list
- [ ] Filter by status and user
- [ ] Create Show.tsx with request details
- [ ] Show approval timeline
- [ ] Add action buttons (approve/reject) based on role
- [ ] Write tests for views
- [ ] Test permission-based UI

### Task 4.4: Implement Stok Check on Approval
- [ ] On Level 1 approval, verify stok tersedia
- [ ] Show warning if stok tidak cukup
- [ ] Allow operator to adjust jumlah disetujui
- [ ] Write tests for stok verification
- [ ] Test adjustment logic

### Task 4.5: Task: Conductor - User Manual Verification 'Phase 4: Permintaan & Approval' (Protocol in workflow.md)

---

## Phase 5: Distribusi & Konfirmasi

### Task 5.1: Create Distribusi Feature
- [~] Add POST /requests/{id}/distribute route
- [~] Update status to 'diserahkan'
- [~] Create distribute form (input jumlah diberikan)
- [~] Don't create StockMutations yet (wait for confirmation)
- [~] Write tests for distribusi
- [~] Test distribusi flow

### Task 5.2: Create Konfirmasi Terima
- [~] Add POST /requests/{id}/confirm-receive route
- [~] Update status to 'diterima'
- [~] Create StockMutations (jenis: keluar)
- [~] Update item stok
- [~] Write tests for confirmation
- [~] Test stok reduction

### Task 5.3: Add Status Tracking UI
- [ ] Create status timeline component
- [ ] Show: Pending → L1 → L2 → L3 → Diserahkan → Diterima
- [ ] Highlight current status
- [ ] Show who approved and when
- [ ] Write tests for timeline
- [ ] Test status display

### Task 5.4: Task: Conductor - User Manual Verification 'Phase 5: Distribusi & Konfirmasi' (Protocol in workflow.md)

---

## Phase 6: Stock Opname

### Task 6.1: Create Stock Opname Form
- [x] Create stock opname form
- [x] Input: periode (bulan/tahun)
- [x] Generate list of all items with current stok
- [x] Input field for stok_fisik
- [x] Auto-calculate selisih
- [x] Create POST /stock-opnames route
- [x] Save StockOpname + StockOpnameDetails
- [x] Write tests for SO creation
- [x] Test selisih calculation

### Task 6.2: Create Berita Acara PDF
- [ ] Install PDF generation library
- [ ] Create BA PDF template
- [x] Add GET /stock-opnames/{id}/ba-pdf route
- [ ] Generate PDF with:
  - Header info (no SO, tanggal, periode)
  - List items with selisih
  - Summary and signatures
- [ ] Write tests for PDF generation
- [ ] Test PDF download

### Task 6.3: Create Stock Opname Approval
- [x] Add POST /stock-opnames/{id}/submit route
- [x] Add POST /stock-opnames/{id}/approve route
- [x] On approval, create adjustment StockMutations
- [x] Update item stok based on selisih
- [x] Write tests for approval and adjustment
- [x] Test stok adjustment logic

### Task 6.4: Create Stock Opname List & Detail Views
- [x] Create Index.tsx with SO list
- [x] Filter by status and periode
- [x] Create Show.tsx with SO details
- [x] Show selisih summary
- [x] Add action buttons (submit, approve, download BA)
- [ ] Write tests for views (requires built frontend)
- [ ] Test permission-based actions

### Task 6.5: Task: Conductor - User Manual Verification 'Phase 6: Stock Opname' (Protocol in workflow.md)

---

## Phase 7: Reorder Alert & Dashboard

### Task 7.1: Create Reorder Alert System
- [x] Create query for items below stok minimal
- [x] Create alert component (banner)
- [ ] Show in dashboard and items list
- [ ] Add badge/warning color to items
- [x] Write tests for alert logic
- [ ] Test alert display

### Task 7.2: Create Dashboard Widgets
- [x] Create summary cards:
  - Total items
  - Items below reorder point
  - Pending requests
  - Purchases in progress
- [ ] Create recent activity list
- [ ] Add quick action buttons
- [ ] Write tests for widgets
- [ ] Test dashboard display

### Task 7.3: Implement Email/WA Alert (Optional)
- [ ] Setup Fonnte API integration
- [ ] Create notification service
- [ ] Send alert when items reach reorder point
- [ ] Write tests for notifications
- [ ] Test notification delivery

### Task 7.4: Task: Conductor - User Manual Verification 'Phase 7: Reorder Alert & Dashboard' (Protocol in workflow.md)

---

## Phase 8: Laporan & Permissions

### Task 8.1: Create Monthly Report
- [~] Add GET /reports/monthly route
- [~] Filter by periode (bulan/tahun)
- [~] Query all transactions:
  - Requests (approved)
  - Purchases (completed)
  - Stock Opnames
- [~] Calculate summaries
- [~] Create monthly report page
- [~] Write tests for report queries
- [~] Test report accuracy

### Task 8.2: Create Report Exports
- [~] Add GET /reports/monthly/pdf route
- [~] Add GET /reports/monthly/excel route
- [~] Generate PDF with cumulative data
- [~] Generate Excel with transaction details
- [~] Write tests for exports
- [~] Test file downloads

### Task 8.3: Define ATK Permissions
- [~] Define permissions in PermissionsSeeder
- [~] Add: manage_items, manage_purchases, create_request, approve_request_l1, approve_request_l2, approve_request_l3, manage_stock_opname, view_reports
- [~] Assign permissions to roles
- [~] Write tests for permissions
- [~] Run seeder and verify

### Task 8.4: Apply Permissions & Update UI
- [~] Add permission checks to all controllers
- [~] Update UI based on permissions
- [~] Hide/show features per role
- [~] Write tests for permission-based access
- [~] Test access per role

### Task 8.5: Task: Conductor - User Manual Verification 'Phase 8: Laporan & Permissions' (Protocol in workflow.md)

---

## Phase 9: Final Integration & Testing

### Task 9.1: Run Complete Test Suite
- [ ] Execute `php artisan test --compact`
- [ ] Execute `npm run test` for frontend tests
- [ ] Verify coverage >80%
- [ ] Fix any failing tests
- [ ] Run `vendor/bin/pint --dirty`

### Task 9.2: End-to-End Workflow Testing
- [ ] Test complete pengadaan flow
- [ ] Test complete permintaan & approval flow
- [ ] Test stock opname flow
- [ ] Test distribusi & konfirmasi flow
- [ ] Verify kartu stok updates correctly

### Task 9.3: Browser Testing
- [ ] Test all pages on mobile
- [ ] Test all pages on tablet
- [ ] Test all pages on desktop
- [ ] Verify responsive layouts
- [ ] Test all forms and submissions

### Task 9.4: Data Integrity Testing
- [ ] Verify stok calculations are correct
- [ ] Verify kartu stok balances
- [ ] Verify approval workflow integrity
- [ ] Test concurrent operations
- [ ] Verify soft deletes work correctly

### Task 9.5: Task: Conductor - User Manual Verification 'Phase 9: Final Integration & Testing' (Protocol in workflow.md)
