# Office Purchases E2E Test Coverage

## Overview
Comprehensive Playwright E2E tests for the Office Purchases (Pembelian Kantor) feature.

**File:** `/tests/e2e/office-purchases.spec.ts`

**Total Tests:** 36 tests across 9 test suites

## Test Suites

### 1. Office Purchases - Index Page (3 tests)
**Halaman Daftar Pembelian**

- ✅ Should display office purchases list page with correct elements
- ✅ Should display purchase table columns correctly
- ✅ Should paginate purchases list

### 2. Office Purchases - Create Purchase (7 tests)
**Membuat Pembelian**

- ✅ Should create new office purchase with single item
- ✅ Should create purchase with multiple items
- ✅ Should dynamically add and remove purchase items
- ✅ Should calculate total correctly
- ✅ Should validate required fields
- ✅ Should validate minimum quantity
- ✅ Should prevent negative price

### 3. Office Purchases - View Details (4 tests)
**Lihat Detail**

- ✅ Should display purchase detail page
- ✅ Should display all purchase information
- ✅ Should display purchase items with quantities and prices
- ✅ Should display notes/keterangan if present

### 4. Office Purchases - Filter and Search (3 tests)
**Filter dan Pencarian**

- ✅ Should filter purchases by date range
- ✅ Should search purchases by supplier name
- ✅ Should clear filters and show all results

### 5. Office Purchases - Stock Management (2 tests)
**Manajemen Stok**

- ✅ Should update stock after creating purchase
- ✅ Should create mutation record for purchase

### 6. Office Purchases - Reports and Export (2 tests)
**Laporan dan Ekspor**

- ✅ Should display purchase totals summary
- ✅ Should have export functionality

### 7. Office Purchases - Supplier Selection (2 tests)
**Pilihan Supplier**

- ✅ Should autocomplete or suggest suppliers
- ✅ Should allow entering new supplier

### 8. Office Purchases - Permissions (3 tests)
**Izin**

- ✅ Should hide create button for users without permission
- ✅ Should allow users with permission to create purchases
- ✅ Should prevent access for unauthorized users

### 9. Office Purchases - Responsive Design (2 tests)
**Desain Responsif**

- ✅ Should display correctly on mobile (375x667)
- ✅ Should display correctly on tablet (768x1024)

### 10. Office Purchases - Navigation (2 tests)
**Navigasi**

- ✅ Should navigate from list to detail and back
- ✅ Should have breadcrumb navigation

### 11. Office Purchases - Data Integrity (2 tests)
**Integritas Data**

- ✅ Should display purchase number in correct format (PO-YYYYMMDD-XXXXX)
- ✅ Should preserve data on page refresh

### 12. Office Purchases - Edge Cases (3 tests)
**Kasus Tepi**

- ✅ Should handle very long supplier names (100 chars)
- ✅ Should handle empty list gracefully
- ✅ Should handle special characters in notes

## Routes Covered

```php
GET  /office-purchases              - List office purchases
POST /office-purchases              - Create new purchase
GET  /office-purchases/{id}         - View purchase detail
```

## Controller Tested

`App\Http\Controllers\OfficePurchaseController`

## Models Tested

- `App\Models\OfficePurchase`
- `App\Models\OfficePurchaseDetail`
- `App\Models\OfficeSupply` (for stock updates)
- `App\Models\OfficeMutation` (for mutation records)

## Validation Rules Tested

Based on `StoreOfficePurchaseRequest`:

- ✅ `tanggal` - required, date
- ✅ `supplier` - required, string, max:100
- ✅ `keterangan` - nullable, string, max:1000
- ✅ `items` - required, array, min:1
- ✅ `items.*.supply_id` - required, exists:office_supplies,id
- ✅ `items.*.jumlah` - required, integer, min:1
- ✅ `items.*.subtotal` - nullable, numeric, min:0

## Features Tested

### Core Functionality
- ✅ Creating purchases with single and multiple items
- ✅ Dynamic item addition/removal
- ✅ Total calculation validation
- ✅ Viewing purchase details
- ✅ Stock automatic updates
- ✅ Mutation record creation

### User Interface
- ✅ List page with pagination
- ✅ Detail page with all information
- ✅ Create/edit forms
- ✅ Supplier autocomplete
- ✅ Filter and search functionality
- ✅ Responsive design (mobile, tablet)

### Data Management
- ✅ Validation of all required fields
- ✅ Min/max quantity validation
- ✅ Price validation (no negative values)
- ✅ Supplier name length validation
- ✅ Special characters in notes

### Permissions
- ✅ Super admin can create purchases
- ✅ Regular users may have restricted access
- ✅ Create button visibility based on permissions

## Running the Tests

### Run all office purchases tests:
```bash
npx playwright test tests/e2e/office-purchases.spec.ts
```

### Run specific test suite:
```bash
npx playwright test tests/e2e/office-purchases.spec.ts --grep "Create Purchase"
```

### Run in headed mode (watch browser):
```bash
npx playwright test tests/e2e/office-purchases.spec.ts --headed
```

### Run with UI mode:
```bash
npx playwright test tests/e2e/office-purchases.spec.ts --ui
```

## Test Users Used

- `testUsers.superAdmin` - admin@pa-penajam.go.id (full permissions)
- `testUsers.pegawai` - pegawai@demo.com (limited permissions)

## Key Test Scenarios

### Complete Purchase Flow
1. Navigate to `/office-purchases`
2. Click "Create Purchase" button
3. Fill in supplier information
4. Add purchase items (1 or more)
5. Set quantities and prices
6. Verify total calculation
7. Submit form
8. Verify success message
9. Verify redirect to detail page

### Stock Management Verification
1. Get initial stock level
2. Create purchase with quantity
3. Verify stock increased by purchase quantity
4. Verify mutation record created

### Form Validation
1. Try submit without required fields
2. Try submit with zero quantity
3. Try submit with negative price
4. Verify appropriate error messages

## Bilingual Comments

All tests include both Indonesian and English comments:
- Indonesian: `// Harus menampilkan...`
- English: `// Should display...`

## Notes

- Tests use the existing auth helper functions from `/tests/e2e/support/auth.ts`
- Tests follow the same structure as other E2E tests in the project
- Tests are designed to be independent and can run in parallel
- Tests include proper cleanup (logout) after each test
- Tests handle both success and failure scenarios

## Future Enhancements

Potential additions:
- Edit purchase functionality (if implemented)
- Delete purchase functionality (if implemented)
- Status workflow tests (if implemented)
- Export/download verification
- Advanced filtering scenarios
- Bulk operations (if implemented)
