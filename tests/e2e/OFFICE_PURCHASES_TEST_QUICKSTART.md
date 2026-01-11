# Office Purchases E2E Tests - Quick Start Guide

## File Location
```
/tests/e2e/office-purchases.spec.ts
```

## Test Statistics
- **Total Tests:** 36
- **Test Suites:** 12
- **Languages:** Bilingual (Indonesian & English comments)

## Quick Commands

### Run All Tests
```bash
npx playwright test tests/e2e/office-purchases.spec.ts
```

### Run in Headed Mode (Watch Browser)
```bash
npx playwright test tests/e2e/office-purchases.spec.ts --headed
```

### Run in UI Mode (Interactive)
```bash
npx playwright test tests/e2e/office-purchases.spec.ts --ui
```

### Run Specific Test Suite
```bash
# Create Purchase tests only
npx playwright test tests/e2e/office-purchases.spec.ts --grep "Create Purchase"

# Validation tests only
npx playwright test tests/e2e/office-purchases.spec.ts --grep "validate"

# Permission tests only
npx playwright test tests/e2e/office-purchases.spec.ts --grep "Permissions"
```

### Run Specific Test
```bash
# Single item creation test
npx playwright test tests/e2e/office-purchases.spec.ts --grep "create new office purchase with single item"

# Stock management test
npx playwright test tests/e2e/office-purchases.spec.ts --grep "update stock"
```

### Debug Mode
```bash
npx playwright test tests/e2e/office-purchases.spec.ts --debug
```

### List All Tests
```bash
npx playwright test tests/e2e/office-purchases.spec.ts --list
```

## Test Structure

### 1. Index Page Tests (3 tests)
Tests the purchases list page, table columns, and pagination.

### 2. Create Purchase Tests (7 tests)
- Single item purchase
- Multiple items purchase
- Dynamic add/remove items
- Total calculation
- Required fields validation
- Minimum quantity validation
- Negative price prevention

### 3. View Details Tests (4 tests)
Tests the purchase detail page and all information display.

### 4. Filter & Search Tests (3 tests)
Tests date range filtering and supplier search functionality.

### 5. Stock Management Tests (2 tests)
Verifies automatic stock updates and mutation record creation.

### 6. Reports & Export Tests (2 tests)
Tests totals summary and export functionality.

### 7. Supplier Selection Tests (2 tests)
Tests supplier autocomplete and new supplier entry.

### 8. Permissions Tests (3 tests)
Tests access control for different user roles.

### 9. Responsive Design Tests (2 tests)
Tests mobile and tablet layouts.

### 10. Navigation Tests (2 tests)
Tests navigation and breadcrumbs.

### 11. Data Integrity Tests (2 tests)
Tests purchase number format and data persistence.

### 12. Edge Cases Tests (3 tests)
Tests long supplier names, empty lists, and special characters.

## Routes Tested

```
GET  /office-purchases              # List page
POST /office-purchases              # Create purchase
GET  /office-purchases/{id}         # Detail page
```

## Test Users

### Super Admin (Full Access)
```typescript
{
  email: 'admin@pa-penajam.go.id',
  password: 'password'
}
```

### Pegawai (Limited Access)
```typescript
{
  email: 'pegawai@demo.com',
  password: 'password'
}
```

## What Gets Tested

### Form Fields
- ✅ Date picker (tanggal)
- ✅ Supplier input (supplier)
- ✅ Item selection (supply_id)
- ✅ Quantity input (jumlah)
- ✅ Price/subtotal (subtotal)
- ✅ Notes (keterangan)

### Validation
- ✅ Required fields
- ✅ Minimum quantity (1)
- ✅ No negative prices
- ✅ Supplier max length (100)
- ✅ Notes max length (1000)

### Business Logic
- ✅ Stock updates automatically
- ✅ Mutation records created
- ✅ Purchase number generation (PO-YYYYMMDD-XXXXX)
- ✅ Total calculation

### UI/UX
- ✅ Responsive design (mobile/tablet)
- ✅ Pagination
- ✅ Search/filter
- ✅ Navigation
- ✅ Breadcrumbs

## Example Test Output

```
Running 36 tests using 1 worker

✓ [chromium] › office-purchases.spec.ts:36:3 › Office Purchases - Index Page › should display office purchases list page
✓ [chromium] › office-purchases.spec.ts:55:3 › Office Purchases - Index Page › should display purchase table columns
✓ [chromium] › office-purchases.spec.ts:103:3 › Office Purchases - Create Purchase › should create new office purchase with single item
...

36 passed (45.2s)
```

## Troubleshooting

### Database Errors
If you encounter database errors:
```bash
touch database/database.e2e.sqlite
php artisan migrate:fresh --seed --env=e2e
```

### Timeout Errors
Increase timeout in `playwright.config.ts`:
```typescript
use: {
  actionTimeout: 10000,
  navigationTimeout: 30000,
}
```

### Headless Issues
Run in headed mode to see what's happening:
```bash
npx playwright test tests/e2e/office-purchases.spec.ts --headed --project=chromium
```

## Coverage Summary

| Category | Tests | Status |
|----------|-------|--------|
| Create/Read | 14 | ✅ Complete |
| Validation | 3 | ✅ Complete |
| Stock Management | 2 | ✅ Complete |
| Filter/Search | 3 | ✅ Complete |
| Permissions | 3 | ✅ Complete |
| Responsive | 2 | ✅ Complete |
| Navigation | 2 | ✅ Complete |
| Data Integrity | 2 | ✅ Complete |
| Edge Cases | 3 | ✅ Complete |
| **TOTAL** | **36** | **✅ Complete** |

## Notes

- All tests include bilingual comments (Indonesian & English)
- Tests are independent and can run in parallel
- Proper cleanup (logout) after each test
- Uses existing auth helpers from `support/auth.ts`
- Follows project's E2E test conventions

## Related Files

- Controller: `app/Http/Controllers/OfficePurchaseController.php`
- Request: `app/Http/Requests/StoreOfficePurchaseRequest.php`
- Models: `app/Models/OfficePurchase.php`, `OfficePurchaseDetail.php`
- Auth Helpers: `tests/e2e/support/auth.ts`
- Test Users: `tests/e2e/support/test-users.ts`
