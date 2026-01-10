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
- [ ] Create migration for stock_opnames table
- [ ] Create migration for stock_opname_details table
- [ ] Write unit tests for StockOpname and StockOpnameDetail models
- [ ] Run migrations and verify

### Task 1.5: Create Model Relationships
- [ ] Define Item relationships (hasMany mutations, requestDetails, etc.)
- [ ] Define Purchase relationships (hasMany details, items)
- [ ] Define Request relationships (hasMany details, user, department)
- [ ] Define StockMutation relationships (belongsTo item)
- [ ] Write tests for all relationships
- [ ] Run `vendor/bin/pint --dirty`

### Task 1.6: Task: Conductor - User Manual Verification 'Phase 1: Database & Model Setup' (Protocol in workflow.md)

---

## Phase 2: Master Data ATK

### Task 2.1: Create Items CRUD
- [ ] Create ItemController with CRUD methods
- [ ] Add routes: GET /items, POST /items, PUT /items/{id}
- [ ] Create validation rules (ItemRequest)
- [ ] Write tests for CRUD operations
- [ ] Test permissions per role

### Task 2.2: Create Items UI Components
- [ ] Create Index.tsx with table view
- [ ] Create Create.tsx form
- [ ] Create Show.tsx detail view
- [ ] Add reorder point indicator (badge)
- [ ] Write tests for components
- [ ] Test responsive behavior

### Task 2.3: Create Kartu Stok View
- [ ] Add GET /items/{id}/mutations route
- [ ] Create controller method with pagination
- [ ] Create mutations list component
- [ ] Show running balance (stok sesudah)
- [ ] Filter by jenis mutasi and date range
- [ ] Write tests for kartu stok
- [ ] Test real-time updates

### Task 2.4: Task: Conductor - User Manual Verification 'Phase 2: Master Data ATK' (Protocol in workflow.md)

---

## Phase 3: Workflow Pengadaan (3-Step)

### Task 3.1: Create Input Pembelian
- [ ] Create purchase form component
- [ ] Add dynamic item rows (item, jumlah, harga)
- [ ] Calculate subtotal and total
- [ ] Create POST /purchases route
- [ ] Save Purchase + PurchaseDetails
- [ ] Write tests for purchase creation
- [ ] Test form validation

### Task 3.2: Create Penerimaan Barang
- [ ] Create Receive.tsx page
- [ ] Show purchase details
- [ ] Form untuk verify barang diterima
- [ ] Adjust quantity jika ada selisih
- [ ] Create POST /purchases/{id}/receive route
- [ ] Update status to 'received'
- [ ] Write tests for receiving process

### Task 3.3: Create Update Stok Process
- [ ] Create complete purchase flow
- [ ] Add POST /purchases/{id}/complete route
- [ ] Create StockMutations for each item
- [ ] Update item stok
- [ ] Update harga rata-rata
- [ ] Write tests for stok update
- [ ] Test stok calculations

### Task 3.4: Create Purchase List & Detail Views
- [ ] Create Index.tsx with purchase list
- [ ] Filter by status
- [ ] Create Show.tsx with purchase details
- [ ] Show timeline status (draft → received → completed)
- [ ] Write tests for views
- [ ] Test status transitions

### Task 3.5: Task: Conductor - User Manual Verification 'Phase 3: Workflow Pengadaan' (Protocol in workflow.md)

---

## Phase 4: Permintaan & Approval Workflow

### Task 4.1: Create Permintaan Form
- [ ] Create request form for Pegawai
- [ ] Add dynamic item rows
- [ ] Validate stok tersedia (warning only)
- [ ] Create POST /requests route
- [ ] Save Request + RequestDetails
- [ ] Set initial status to 'pending'
- [ ] Write tests for request creation
- [ ] Test form submission

### Task 4.2: Create Approval System
- [ ] Create approval component
- [ ] Add POST /requests/{id}/approve-level1
- [ ] Add POST /requests/{id}/approve-level2
- [ ] Add POST /requests/{id}/approve-level3
- [ ] Add POST /requests/{id}/reject
- [ ] Implement approval logic with role checks
- [ ] Write tests for each approval level
- [ ] Test approval workflow

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
- [ ] Add POST /requests/{id}/distribute route
- [ ] Update status to 'diserahkan'
- [ ] Create distribute form (input jumlah diberikan)
- [ ] Don't create StockMutations yet (wait for confirmation)
- [ ] Write tests for distribusi
- [ ] Test distribusi flow

### Task 5.2: Create Konfirmasi Terima
- [ ] Add POST /requests/{id}/confirm-receive route
- [ ] Update status to 'diterima'
- [ ] Create StockMutations (jenis: keluar)
- [ ] Update item stok
- [ ] Write tests for confirmation
- [ ] Test stok reduction

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
- [ ] Create stock opname form
- [ ] Input: periode (bulan/tahun)
- [ ] Generate list of all items with current stok
- [ ] Input field for stok_fisik
- [ ] Auto-calculate selisih
- [ ] Create POST /stock-opnames route
- [ ] Save StockOpname + StockOpnameDetails
- [ ] Write tests for SO creation
- [ ] Test selisih calculation

### Task 6.2: Create Berita Acara PDF
- [ ] Install PDF generation library
- [ ] Create BA PDF template
- [ ] Add GET /stock-opnames/{id}/ba-pdf route
- [ ] Generate PDF with:
  - Header info (no SO, tanggal, periode)
  - List items with selisih
  - Summary and signatures
- [ ] Write tests for PDF generation
- [ ] Test PDF download

### Task 6.3: Create Stock Opname Approval
- [ ] Add POST /stock-opnames/{id}/submit route
- [ ] Add POST /stock-opnames/{id}/approve route
- [ ] On approval, create adjustment StockMutations
- [ ] Update item stok based on selisih
- [ ] Write tests for approval and adjustment
- [ ] Test stok adjustment logic

### Task 6.4: Create Stock Opname List & Detail Views
- [ ] Create Index.tsx with SO list
- [ ] Filter by status and periode
- [ ] Create Show.tsx with SO details
- [ ] Show selisih summary
- [ ] Add action buttons (submit, approve, download BA)
- [ ] Write tests for views
- [ ] Test permission-based actions

### Task 6.5: Task: Conductor - User Manual Verification 'Phase 6: Stock Opname' (Protocol in workflow.md)

---

## Phase 7: Reorder Alert & Dashboard

### Task 7.1: Create Reorder Alert System
- [ ] Create query for items below stok minimal
- [ ] Create alert component (banner)
- [ ] Show in dashboard and items list
- [ ] Add badge/warning color to items
- [ ] Write tests for alert logic
- [ ] Test alert display

### Task 7.2: Create Dashboard Widgets
- [ ] Create summary cards:
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
- [ ] Add GET /reports/monthly route
- [ ] Filter by periode (bulan/tahun)
- [ ] Query all transactions:
  - Requests (approved)
  - Purchases (completed)
  - Stock Opnames
- [ ] Calculate summaries
- [ ] Create monthly report page
- [ ] Write tests for report queries
- [ ] Test report accuracy

### Task 8.2: Create Report Exports
- [ ] Add GET /reports/monthly/pdf route
- [ ] Add GET /reports/monthly/excel route
- [ ] Generate PDF with cumulative data
- [ ] Generate Excel with transaction details
- [ ] Write tests for exports
- [ ] Test file downloads

### Task 8.3: Define ATK Permissions
- [ ] Define permissions in PermissionsSeeder
- [ ] Add: manage_items, manage_purchases, create_request, approve_request_l1, approve_request_l2, approve_request_l3, manage_stock_opname, view_reports
- [ ] Assign permissions to roles
- [ ] Write tests for permissions
- [ ] Run seeder and verify

### Task 8.4: Apply Permissions & Update UI
- [ ] Add permission checks to all controllers
- [ ] Update UI based on permissions
- [ ] Hide/show features per role
- [ ] Write tests for permission-based access
- [ ] Test access per role

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
