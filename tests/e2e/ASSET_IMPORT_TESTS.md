# Asset Import E2E Test Suite

Comprehensive Playwright E2E tests for the Asset Import (SIMAN JSON) feature in the Asset & Persediaan Management System.

## Overview / Ringkasan

**Test File**: `/home/moohard/dev/work/asset-persediaan-system/tests/e2e/asset-import.spec.ts`

**Total Tests**: 42 tests

**Test Categories**: 9 categories covering all aspects of the asset import workflow

**Fixtures Directory**: `/home/moohard/dev/work/asset-persediaan-system/tests/e2e/fixtures/`

**Number of Fixtures**: 13 JSON files + 1 PDF file

## Routes Tested / Rute yang Diuji

- `GET /assets/import` - Import page display
- `POST /assets/import` - File upload and processing
- `POST /assets/import/confirm` - Confirm and execute import

## Controllers & Services Tested

- **Controller**: `AssetController.php` (import, processImport, confirmImport methods)
- **Service**: `AssetImportService.php` (import, getPreview, getMetadata methods)
- **Request**: `ImportAssetRequest.php` (validation rules)

## Test Categories

### 1. Page Display Tests (3 tests)
Location: Lines 28-66

Tests for verifying the import page loads correctly with all necessary UI components.

```typescript
test.describe('Asset Import - Page Display', () => {
  test('should display import page with title and instructions')
  test('should display file upload component')
  test('should have proper page title metadata')
});
```

**Coverage**:
- Page heading and title verification
- Upload component visibility
- Instructions presence
- Page metadata (title tag)

### 2. Valid JSON Upload Tests (5 tests)
Location: Lines 68-191

Tests for successful file upload and processing.

```typescript
test.describe('Asset Import - Valid JSON Upload', () => {
  test('should successfully upload and parse valid JSON file')
  test('should display preview table after upload')
  test('should display metadata information after upload')
  test('should show row count matching uploaded file')
  test('should display confirm and cancel buttons after successful upload')
});
```

**Coverage**:
- File upload mechanics
- JSON parsing
- Preview table generation
- Metadata extraction
- Action button display (confirm/cancel)

### 3. Invalid File Handling Tests (5 tests)
Location: Lines 193-281

Tests for various error scenarios when uploading invalid files.

```typescript
test.describe('Asset Import - Invalid File Handling', () => {
  test('should reject non-JSON file format')
  test('should reject empty JSON file')
  test('should reject malformed JSON data')
  test('should display error for missing required columns')
  test('should reject oversized file (>10MB)')
});
```

**Fixtures Used**:
- `sample.pdf` - Wrong file format
- `assets-import-empty.json` - Empty data
- `assets-import-malformed.json` - Invalid JSON syntax
- `assets-import-missing-fields.json` - Missing required fields

**Coverage**:
- File format validation
- Empty file handling
- JSON syntax errors
- Required field validation
- File size limits

### 4. Preview and Validation Tests (5 tests)
Location: Lines 283-387

Tests for the preview functionality after file upload.

```typescript
test.describe('Asset Import - Preview and Validation', () => {
  test('should display all expected columns in preview')
  test('should validate duplicate asset codes')
  test('should highlight error rows in preview')
  test('should display validation errors for invalid categories')
  test('should handle pagination for large datasets')
});
```

**Fixtures Used**:
- `assets-import-valid.json` - Valid data for column checks
- `assets-import-duplicates.json` - Duplicate asset codes
- `assets-import-with-errors.json` - Mixed valid/invalid records
- `assets-import-invalid-category.json` - Category validation
- `assets-import-large.json` - Pagination testing

**Coverage**:
- Table column display
- Duplicate detection
- Error row highlighting
- Category validation
- Pagination controls

### 5. Confirm Import Tests (4 tests)
Location: Lines 389-492

Tests for the import confirmation and execution flow.

```typescript
test.describe('Asset Import - Confirm Import', () => {
  test('should successfully confirm import with valid data')
  test('should redirect to assets index after successful import')
  test('should display import result statistics')
  test('should update existing assets when importing duplicates')
});
```

**Fixtures Used**:
- `assets-import-valid.json` - Standard import
- `assets-import-existing-codes.json` - Update existing assets

**Coverage**:
- Import execution
- Success messages
- Redirect behavior
- Import statistics (success/error counts)
- Update vs create logic

### 6. Cancel Import Tests (2 tests)
Location: Lines 494-551

Tests for canceling the import process.

```typescript
test.describe('Asset Import - Cancel Import', () => {
  test('should cancel import and return to assets list')
  test('should not save data when cancelled')
});
```

**Coverage**:
- Cancel button functionality
- Navigation back to assets list
- Data preservation (no import on cancel)

### 7. Large File Handling Tests (3 tests)
Location: Lines 553-619

Tests for handling large import files.

```typescript
test.describe('Asset Import - Large File Handling', () => {
  test('should handle large file (100+ rows)')
  test('should show processing indicator for large files')
  test('should handle timeout gracefully')
});
```

**Fixture Used**:
- `assets-import-large.json` - 10 records (expandable to 100+)

**Coverage**:
- Large file processing
- Loading indicators
- Timeout handling
- Performance considerations

### 8. Permission Checks Tests (3 tests)
Location: Lines 621-672

Tests for access control and authorization.

```typescript
test.describe('Asset Import - Permission Checks', () => {
  test('should deny access to users without assets.import permission')
  test('should hide import link for unauthorized users')
  test('should allow access for users with assets.import permission')
});
```

**Test Users**:
- `testUsers.superAdmin` - Has `assets.import` permission
- `testUsers.pegawai` - No import permission

**Coverage**:
- Access control (403 forbidden)
- UI element hiding
- Permission-based navigation

### 9. Edge Cases Tests (4 tests)
Location: Lines 674-751

Tests for special characters and unusual data scenarios.

```typescript
test.describe('Asset Import - Edge Cases', () => {
  test('should handle special characters in asset names')
  test('should handle null and empty values in optional fields')
  test('should handle Unicode characters in asset names')
  test('should handle invalid date formats gracefully')
});
```

**Fixtures Used**:
- `assets-import-special-chars.json` - `&`, `"`, `'`, `<`, `>`, `/`, `(`, `)`
- `assets-import-null-values.json` - null, empty strings
- `assets-import-unicode.json` - Chinese, Arabic, Ukrainian, Hebrew, Hindi
- `assets-import-invalid-dates.json` - Various invalid date formats

**Coverage**:
- Special character preservation
- Null value handling
- Unicode/multi-language support
- Date format validation

### 10. Error Recovery Tests (3 tests)
Location: Lines 753-813

Tests for recovering from errors and retry scenarios.

```typescript
test.describe('Asset Import - Error Recovery', () => {
  test('should allow retry after failed upload')
  test('should display helpful error messages')
  test('should preserve form data on validation errors')
});
```

**Coverage**:
- Retry functionality
- Error message clarity
- Form state preservation

### 11. User Experience Tests (4 tests)
Location: Lines 815-876

Tests for user interface and experience quality.

```typescript
test.describe('Asset Import - User Experience', () => {
  test('should provide clear upload instructions')
  test('should show file size limit information')
  test('should have accessible form labels')
  test('should provide visual feedback during upload')
});
```

**Coverage**:
- Instruction clarity
- File size information
- Accessibility (ARIA labels)
- Visual feedback during processing

## Fixture Files Summary

### Valid Data Fixtures
1. `assets-import-valid.json` (3 records) - Standard import test
2. `assets-import-large.json` (10 records) - Large file testing

### Error Scenario Fixtures
3. `assets-import-empty.json` - Empty data array
4. `assets-import-malformed.json` - Invalid JSON syntax
5. `assets-import-missing-fields.json` - Missing required fields
6. `assets-import-with-errors.json` - Mixed valid/invalid records
7. `sample.pdf` - Wrong file format

### Special Case Fixtures
8. `assets-import-duplicates.json` - Duplicate asset IDs
9. `assets-import-existing-codes.json` - Update existing assets
10. `assets-import-invalid-category.json` - Category validation
11. `assets-import-special-chars.json` - Special characters
12. `assets-import-null-values.json` - Null/empty values
13. `assets-import-unicode.json` - Multi-language support
14. `assets-import-invalid-dates.json` - Date format testing

## Running the Tests

### Run All Asset Import Tests
```bash
npx playwright test asset-import
```

### Run Specific Category
```bash
# Page Display tests
npx playwright test asset-import --grep "Page Display"

# Valid Upload tests
npx playwright test asset-import --grep "Valid JSON Upload"

# Invalid File tests
npx playwright test asset-import --grep "Invalid File Handling"

# Permission tests
npx playwright test asset-import --grep "Permission Checks"
```

### Run with UI Mode (Interactive)
```bash
npx playwright test asset-import --ui
```

### Run with Debugging
```bash
npx playwright test asset-import --debug
```

### Run Specific Test
```bash
npx playwright test asset-import --grep "should display import page"
```

## Test Data Requirements

### Authentication
Tests use pre-configured test users from `tests/e2e/support/test-users.ts`:
- `testUsers.superAdmin` - Full permissions
- `testUsers.pegawai` - Limited permissions (for negative testing)

### Database
Tests run against E2E database (`database/database.e2e.sqlite`) which is:
- Freshly migrated before each test run
- Seeded with test data via `E2ESeeder.php`
- Isolated from development/production databases

### Environment
Tests use `APP_ENV=e2e` configuration with:
- `E2E_BASE_URL`: `http://localhost:8011`
- Web server auto-started via Playwright
- Separate environment settings

## Key Features Tested

### File Upload Mechanics
- `page.setInputFiles()` for file selection
- File validation (format, size, structure)
- JSON parsing and error handling
- Upload progress feedback

### Data Validation
- Required field validation
- Data type validation
- Duplicate detection
- Category validation
- Location mapping (auto-creation)

### Import Execution
- Create vs Update logic
- Transaction handling (chunked imports)
- Error recovery and rollback
- Import statistics reporting

### User Interface
- Preview table display
- Pagination for large datasets
- Error highlighting
- Success/error messages
- Confirm/Cancel workflow

### Access Control
- Permission checks (`assets.import`)
- 403 forbidden handling
- UI element hiding based on permissions
- Navigation protection

### Special Cases
- Unicode character support
- Special character handling
- Null/empty value processing
- Invalid date format handling
- Large file processing

## Expected Outcomes

### Successful Import Flow
1. Navigate to `/assets/import`
2. Select valid JSON file
3. See preview table with data
4. Click confirm button
5. See success message with statistics
6. Data imported to database

### Failed Import Flow
1. Navigate to `/assets/import`
2. Select invalid file
3. See error message
4. Can retry with different file
5. No data imported

### Cancel Flow
1. Navigate to `/assets/import`
2. Select valid file
3. See preview
4. Click cancel button
5. Return to assets list
6. No data imported

## Known Limitations

1. **Large File Testing**: Current `assets-import-large.json` has 10 records. For true 100+ row testing, this file should be expanded.

2. **File Size Testing**: Tests verify validation exists but don't actually test 10MB+ file upload (would require large fixture file).

3. **Database Verification**: Most tests verify UI behavior rather than actual database state (would require additional database queries in tests).

4. **Network Simulation**: Tests don't simulate slow network conditions for import progress indicators.

## Future Enhancements

### Additional Test Scenarios
1. **Concurrent Imports**: Test multiple users importing simultaneously
2. **Network Throttling**: Test import progress under slow network
3. **Database Verification**: Add direct database checks in tests
4. **Performance Testing**: Measure import time for various file sizes
5. **Audit Trail**: Verify import history is logged

### Improved Fixtures
1. **Real Large File**: Create actual 100+ record fixture
2. **10MB+ File**: Create oversized file for actual rejection test
3. **SIMAN Export**: Use actual SIMAN export for realistic testing

### Accessibility Testing
1. **Screen Reader**: Test with screen reader simulation
2. **Keyboard Navigation**: Verify full keyboard accessibility
3. **High Contrast**: Test with high contrast mode

## Dependencies

### NPM Packages
- `@playwright/test` - Test framework
- `playwright` - Browser automation

### Internal Dependencies
- `tests/e2e/support/auth.ts` - Login/logout helpers
- `tests/e2e/support/test-users.ts` - Test user definitions
- `tests/e2e/.auth/super_admin.json` - Auth storage state

### Laravel Dependencies
- `AssetController.php` - Main controller
- `AssetImportService.php` - Import logic
- `ImportAssetRequest.php` - Validation rules
- `Asset.php` - Asset model
- `Location.php` - Location model

## Troubleshooting

### Common Issues

1. **Test Fails to Find File**
   - Ensure fixtures directory exists
   - Check file paths are absolute
   - Verify `__dirname` resolution

2. **Permission Denied**
   - Check test user permissions
   - Verify `assets.import` permission is assigned
   - Check middleware configuration

3. **Database Errors**
   - Run migrations: `php artisan migrate:fresh --seed --env=e2e`
   - Check E2E seeder is running
   - Verify database connection

4. **Timeout Errors**
   - Increase timeout in `playwright.config.ts`
   - Check web server is running
   - Verify database performance

### Debugging Tips

1. **Run in UI Mode**: `npx playwright test asset-import --ui`
2. **Run with Debugging**: `npx playwright test asset-import --debug`
3. **Run Single Test**: Use `--grep` to isolate failing test
4. **Check Screenshots**: Look in `test-results/` for failure screenshots
5. **Review Traces**: Use Playwright HTML report for detailed traces

## Code Quality

### Standards Followed
- **TypeScript**: Full type safety with type annotations
- **Comments**: Indonesian and English bilingual comments
- **Structure**: Logical grouping with `test.describe()`
- **Naming**: Descriptive test names following "should..." pattern
- **Cleanup**: Proper `beforeEach`/`afterEach` for login/logout

### Formatting
- Code formatted with **Laravel Pint**
- Follows project ESLint/Prettier config
- Consistent indentation (2 spaces)
- Max line length considerations

## Maintenance

### When to Update Tests

1. **Import Feature Changes**
   - Add/modify fields in JSON structure
   - Update validation rules
   - Change import logic/flow

2. **UI Changes**
   - Update selectors
   - Modify assertions
   - Check accessibility

3. **Permission Changes**
   - Update test user roles
   - Modify permission checks
   - Verify access control

### Updating Fixtures

1. Add new fixtures for new scenarios
2. Update existing fixtures if JSON structure changes
3. Keep fixtures realistic but minimal
4. Document new fixtures in `fixtures/README.md`

## Documentation

### Related Documentation
- **E2E Test README**: `tests/e2e/README.md`
- **Fixtures README**: `tests/e2e/fixtures/README.md`
- **Playwright Config**: `playwright.config.ts`
- **Asset Import Service**: `app/Services/AssetImportService.php`
- **Import Validation**: `app/Http/Requests/ImportAssetRequest.php`

## Contributors

This test suite follows the E2E testing patterns established in:
- `tests/e2e/assets.spec.ts`
- `tests/e2e/items-crud.spec.ts`
- `tests/e2e/auth.spec.ts`

## License

Part of the Asset & Persediaan Management System project.
