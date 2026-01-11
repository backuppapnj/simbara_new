# E2E Test Coverage Gap Analysis Report
## Sistem Manajemen Aset dan Persediaan - PA Penajam

**Analysis Date:** 2025-01-11
**Project:** Laravel 12 + Inertia v2 + React 19
**E2E Framework:** Playwright

---

## Executive Summary

This report analyzes the current E2E test coverage for the Asset/Persediaan Management System and identifies critical gaps in testing. The system is a government office management system (PA Penajam) with features including assets, purchases, stock opname, ATK requests, office supplies, RBAC, and WhatsApp notifications.

### Current Test Coverage
✅ **Already Covered (8 test files):**
- Authentication (login, logout, invalid credentials)
- Assets (list, search, view details)
- Purchase Flow (draft → receive → complete)
- Stock Opname (view approved, download PDF)
- Security (basic checks)
- Performance (metrics)
- Global Navigation
- ATK Request Workflow

### Test Coverage Gaps
❌ **Missing Coverage (20+ critical areas identified below)**

---

## Critical Missing Test Coverage

### 🔴 HIGH PRIORITY - Security & Authentication (4 areas)

| # | Feature | Routes | Pages | Risk Level |
|---|---------|--------|-------|------------|
| 1 | **Two-Factor Authentication (2FA)** | `/settings/two-factor`, `/two-factor-challenge` | `settings/two-factor.tsx`, `auth/two-factor-challenge.tsx` | **CRITICAL** |
| 2 | **Password Reset Flow** | `/forgot-password`, `/reset-password/{token}` | `auth/forgot-password.tsx`, `auth/reset-password.tsx` | **HIGH** |
| 3 | **Password Change** | `/settings/password` | `settings/password.tsx` | **HIGH** |
| 4 | **Profile Management** | `/settings/profile` | `settings/profile.tsx` | **MEDIUM** |

**Why Critical:** 2FA, password reset, and profile management are core security features. Bugs here can lead to unauthorized access.

---

### 🔴 HIGH PRIORITY - Admin Features (4 areas)

| # | Feature | Routes | Controllers | Risk Level |
|---|---------|--------|-------------|------------|
| 5 | **Role Management** | `/admin/roles/*` | `Admin/RoleController.php` | **HIGH** |
| 6 | **Permission Management** | `/admin/permissions/*` | `Admin/PermissionController.php` | **HIGH** |
| 7 | **WhatsApp Settings** | `/admin/whatsapp-settings/*` | `Admin/WhatsAppSettingsController.php` | **MEDIUM** |
| 8 | **Notification Logs** | `/admin/notification-logs/*` | `Admin/NotificationLogController.php` | **MEDIUM** |

**Why Critical:** RBAC (Role-Based Access Control) is fundamental to system security. Incorrect permissions can expose sensitive data.

---

### 🟡 MEDIUM PRIORITY - CRUD Operations (5 areas)

| # | Feature | Routes | Controllers | Missing Tests |
|---|---------|--------|-------------|---------------|
| 9 | **Items CRUD** | `/items/*` | `ItemController.php` | Create, Update, Delete |
| 10 | **Office Supplies CRUD** | `/office-supplies/*` | `OfficeSupplyController.php` | Create, Update, Delete, Mutations |
| 11 | **Office Usages** | `/office-usages/*` | `OfficeUsageController.php` | Create usage log |
| 12 | **Office Purchases** | `/office-purchases/*` | `OfficePurchaseController.php` | Full workflow |
| 13 | **Office Requests** | `/office-requests/*` | `OfficeRequestController.php` | Create, Approve, Reject |

**Why Important:** These are core business operations. Data corruption here affects inventory accuracy.

---

### 🟡 MEDIUM PRIORITY - Reports & Analytics (3 areas)

| # | Feature | Routes | Controllers | Missing Tests |
|---|---------|--------|-------------|---------------|
| 14 | **ATK Reports** | `/atk-reports/*` | `AtkReportController.php` | Stock card, Monthly reports, PDF/Excel export |
| 15 | **Asset Reports** | `/assets/reports/*` | `AssetReportController.php` | SAKTI SIMAN export, by location/category/condition |
| 16 | **Report Generation** | All report routes | Various | Preview, Export, Filter parameters |

**Why Important:** Reports are used for auditing and government compliance. Incorrect reports can lead to regulatory issues.

---

### 🟢 LOW PRIORITY - Edge Cases & UI (8 areas)

| # | Feature | Components | Risk Level |
|---|---------|------------|------------|
| 17 | **Form Validations** | All forms | MEDIUM |
| 18 | **Permission Denials** | All routes | MEDIUM |
| 19 | **Mobile Responsive** | `BottomNav.tsx`, `InstallPrompt.tsx` | LOW |
| 20 | **Offline Mode** | `OfflineAlert.tsx`, `OfflineBanner.tsx` | LOW |
| 21 | **Photo Uploads** | `AssetPhotoUpload.tsx`, camera components | MEDIUM |
| 22 | **Asset Location Updates** | `/assets/{id}/update-location` | MEDIUM |
| 23 | **Asset Maintenance** | `/assets/{id}/maintenance/*` | MEDIUM |
| 24 | **Push Notifications** | `/push-subscriptions/*` | LOW |

---

## Detailed Gap Analysis by Feature

### 1. Two-Factor Authentication (2FA) ❌ CRITICAL

**Routes:**
```
GET  /settings/two-factor        - Show 2FA settings page
POST /two-factor-challenge       - Verify 2FA code
POST /two-factor-recovery-code   - Use recovery code
```

**Components:**
- `resources/js/pages/settings/two-factor.tsx`
- `resources/js/pages/auth/two-factor-challenge.tsx`
- `resources/js/components/two-factor-setup-modal.tsx`
- `resources/js/components/two-factor-recovery-codes.tsx`

**Test Scenarios Needed:**
- [ ] Enable 2FA and generate QR code
- [ ] Verify 2FA with valid TOTP code
- [ ] Verify 2FA with invalid code (should fail)
- [ ] Generate and display recovery codes
- [ ] Login with 2FA enabled
- [ ] Disable 2FA
- [ ] Use recovery code when TOTP unavailable

**Risk:** If 2FA fails, users cannot access the system. Critical for security compliance.

---

### 2. Role Management ❌ HIGH

**Routes:**
```
GET    /admin/roles                 - List all roles
GET    /admin/roles/{role}          - Show role details
PUT    /admin/roles/{role}/users    - Update role users
GET    /admin/roles/{role}/permissions - View role permissions
PUT    /admin/roles/{role}/permissions - Sync permissions
```

**Controllers:**
- `app/Http/Controllers/Admin/RoleController.php`
- `app/Http/Controllers/Admin/RolePermissionController.php`

**Test Scenarios Needed:**
- [ ] View all roles and their user/permission counts
- [ ] View role detail with users tab
- [ ] View role detail with permissions tab
- [ ] Add users to a role
- [ ] Remove users from a role
- [ ] Grant permissions to a role
- [ ] Revoke permissions from a role
- [ ] Verify permission changes take effect immediately

**Risk:** Incorrect role assignments can give unauthorized access to sensitive features.

---

### 3. Items CRUD Operations ❌ MEDIUM

**Routes:**
```
GET    /items              - List items
POST   /items              - Create new item
PUT    /items/{item}       - Update item
DELETE /items/{item}       - Delete item
GET    /items/{item}/mutations - View item mutations
```

**Controllers:**
- `app/Http/Controllers/ItemController.php`

**Test Scenarios Needed:**
- [ ] Create new ATK item with valid data
- [ ] Create item with invalid data (validation errors)
- [ ] Update existing item
- [ ] Delete item (verify it's removed)
- [ ] Search/filter items
- [ ] View item mutation history
- [ ] Verify permission checks (only users with `atk.items.*` can modify)

**Risk:** Data corruption in inventory system affects stock accuracy and reporting.

---

### 4. Password Reset Flow ❌ HIGH

**Routes:**
```
GET  /forgot-password              - Show forgot password form
POST /forgot-password              - Send reset link
GET  /reset-password/{token}       - Show reset form
POST /reset-password               - Reset password
```

**Controllers:**
- `app/Http/Controllers/Auth/PasswordResetLinkController.php`
- `app/Http/Controllers/Auth/NewPasswordController.php`

**Test Scenarios Needed:**
- [ ] Request password reset with valid email
- [ ] Request password reset with invalid email (should not reveal if email exists)
- [ ] Reset password with valid token
- [ ] Reset password with invalid/expired token
- [ ] Verify password strength requirements
- [ ] Login with new password after reset

**Risk:** Users locked out of system if password reset fails. Security risk if reset flow is buggy.

---

### 5. Settings Pages (Profile, Password, Appearance, Notifications) ❌ MEDIUM

**Routes:**
```
GET/PATCH /settings/profile         - Update profile
GET/PUT   /settings/password        - Change password
GET       /settings/appearance      - Appearance settings
GET/PUT   /settings/notifications  - Notification preferences
```

**Test Scenarios Needed:**
- [ ] Update profile name
- [ ] Update profile email
- [ ] Change password (with correct current password)
- [ ] Change password (with wrong current password)
- [ ] Delete account
- [ ] Change appearance theme (light/dark)
- [ ] Update notification preferences
- [ ] Validate all form inputs

**Risk:** User experience issues. Data inconsistency if profile updates fail.

---

### 6. Office Supplies Management ❌ MEDIUM

**Routes:**
```
GET    /office-supplies            - List office supplies
POST   /office-supplies            - Create supply
PUT    /office-supplies/{id}       - Update supply
DELETE /office-supplies/{id}       - Delete supply
GET    /office-supplies/{id}/mutations - View mutations
POST   /office-usages              - Log usage
POST   /office-mutations/quick-deduct - Quick deduct
```

**Test Scenarios Needed:**
- [ ] Create new office supply
- [ ] Update office supply quantity
- [ ] Delete office supply
- [ ] Log office usage
- [ ] Quick deduct from stock
- [ ] View mutation history
- [ ] Verify stock updates correctly

**Risk:** Inventory tracking errors lead to stockouts or overstocking.

---

### 7. ATK Reports Generation ❌ MEDIUM

**Routes:**
```
GET /atk-reports/stock-card/{item}          - Stock card report
GET /atk-reports/stock-card/{item}/pdf      - Stock card PDF
GET /atk-reports/monthly                    - Monthly report
GET /atk-reports/monthly/pdf                - Monthly PDF
GET /atk-reports/monthly/excel              - Monthly Excel
GET /atk-reports/requests                   - Requests report
GET /atk-reports/purchases                  - Purchases report
GET /atk-reports/distributions              - Distributions report
GET /atk-reports/low-stock                  - Low stock report
```

**Test Scenarios Needed:**
- [ ] Generate stock card report for specific item
- [ ] Export stock card to PDF
- [ ] Generate monthly report
- [ ] Export monthly report to PDF
- [ ] Export monthly report to Excel
- [ ] View requests report
- [ ] View purchases report
- [ ] View distributions report
- [ ] View low stock report
- [ ] Verify report data accuracy

**Risk:** Incorrect reports lead to bad decision-making and compliance issues.

---

### 8. Asset Photo Uploads ❌ MEDIUM

**Routes:**
```
GET  /assets/{id}/photos          - List photos
POST /assets/{id}/photos          - Upload photo
PUT  /assets/{assetId}/photos/{photoId} - Update photo
DELETE /assets/{assetId}/photos/{photoId} - Delete photo
```

**Components:**
- `resources/js/components/assets/AssetPhotoUpload.tsx`
- `resources/js/components/camera/camera-capture.tsx`
- `resources/js/components/camera/image-cropper.tsx`

**Test Scenarios Needed:**
- [ ] Upload photo from file system
- [ ] Capture photo from camera
- [ ] Crop uploaded image
- [ ] Set photo as primary
- [ ] Delete photo
- [ ] View photo gallery
- [ ] Handle upload errors

**Risk:** Asset documentation incomplete without photos. Storage costs if uploads fail to clean up.

---

### 9. WhatsApp Settings & Notifications ❌ MEDIUM

**Routes:**
```
GET  /admin/whatsapp-settings      - View settings
POST /admin/whatsapp-settings      - Update settings
POST /admin/whatsapp-settings/test-send - Test WhatsApp
GET  /admin/notification-logs      - View notification logs
GET  /admin/notification-logs/{log} - View log detail
```

**Test Scenarios Needed:**
- [ ] Update WhatsApp API token
- [ ] Update WhatsApp sender number
- [ ] Test WhatsApp message send
- [ ] View notification logs
- [ ] Filter notification logs by status
- [ ] View notification log detail
- [ ] Retry failed notifications

**Risk:** Notifications not sent leads to missed approvals and delays.

---

### 10. Permission-Based Access Control ❌ HIGH

**All Routes with Middleware:**
- `permission:atk.*`
- `permission:assets.*`
- `permission:stock_opnames.*`
- `permission:office.*`
- `permission:roles.manage`
- `permission:settings.whatsapp`

**Test Scenarios Needed:**
- [ ] Verify super_admin can access all routes
- [ ] Verify operator_atk can only access ATK features
- [ ] Verify kasubag_umum can approve ATK requests
- [ ] Verify kpa has limited access
- [ ] Verify pegawai has minimal access
- [ ] Verify 403 forbidden pages for unauthorized access
- [ ] Verify navigation menu hides unauthorized items

**Risk:** Security breach if permissions are not enforced correctly.

---

### 11. Asset Maintenance ❌ MEDIUM

**Routes:**
```
POST /assets/{id}/maintenance              - Create maintenance
GET  /assets/{assetId}/maintenances        - List maintenances
PUT  /assets/{assetId}/maintenances/{id}   - Update maintenance
DELETE /assets/{assetId}/maintenances/{id} - Delete maintenance
```

**Test Scenarios Needed:**
- [ ] Create maintenance record
- [ ] Update maintenance record
- [ ] Delete maintenance record
- [ ] View maintenance history
- [ ] Filter maintenances by status
- [ ] Schedule future maintenance

**Risk:** Asset maintenance tracking failures lead to equipment downtime.

---

### 12. Mobile & Responsive Features ❌ LOW

**Components:**
- `resources/js/Components/Mobile/BottomNav.tsx`
- `resources/js/Components/Mobile/InstallButton.tsx`
- `resources/js/Components/Mobile/InstallPrompt.tsx`
- `resources/js/Components/Mobile/PullToRefresh.tsx`

**Test Scenarios Needed:**
- [ ] Verify bottom navigation on mobile viewport
- [ ] Verify PWA install prompt appears
- [ ] Verify pull-to-refresh functionality
- [ ] Test responsive breakpoints (mobile, tablet, desktop)
- [ ] Verify mobile-specific UI components

**Risk:** Poor mobile user experience for field workers.

---

### 13. Offline Mode ❌ LOW

**Components:**
- `resources/js/Components/Offline/OfflineAlert.tsx`
- `resources/js/Components/Offline/OfflineBanner.tsx`
- `resources/js/Components/Offline/OfflineForm.tsx`

**Test Scenarios Needed:**
- [ ] Verify offline alert appears when network disconnects
- [ ] Verify offline banner shows queued actions
- [ ] Verify forms can be filled offline
- [ ] Verify data syncs when back online
- [ ] Verify offline mode indicators

**Risk:** Data loss if offline changes not properly queued.

---

### 14. Asset Location Updates ❌ MEDIUM

**Routes:**
```
POST /assets/{id}/update-location  - Update asset location
```

**Test Scenarios Needed:**
- [ ] Update asset location
- [ ] Verify location history is tracked
- [ ] View asset location history
- [ ] Search assets by location

**Risk:** Asset tracking errors lead to lost equipment.

---

## Test Infrastructure Recommendations

### 1. Add More Test Data Helpers

Create helper functions in `tests/e2e/support/` for:
- Creating test items
- Creating test assets
- Creating test stock opnames
- Creating test ATK requests
- Setting up test users with different roles

### 2. Add More `data-testid` Attributes

Many components lack `data-testid` attributes, making tests brittle. Add to:
- All form inputs
- All buttons
- All navigation items
- All table rows
- All modal/dialog elements

### 3. Page Object Model Pattern

Consider implementing POM for complex flows:
- `pages/AssetsPage.ts`
- `pages/StockOpnamePage.ts`
- `pages/SettingsPage.ts`
- `pages/Admin/RolesPage.ts`

### 4. API Response Fixtures

Create mock API responses for faster, more reliable tests:
- `fixtures/atk-items.json`
- `fixtures/assets.json`
- `fixtures/roles.json`
- `fixtures/permissions.json`

### 5. Visual Regression Testing

Consider adding visual regression tests for:
- Dashboard layout
- Reports (PDF exports)
- Mobile responsive layouts
- Dark mode appearance

### 6. Performance Budgets

Set performance thresholds in tests:
- Page load time < 2s
- Time to Interactive < 3s
- Largest Contentful Paint < 1.5s

---

## Priority Implementation Order

### Phase 1: Critical Security (Week 1)
1. ✅ `settings-two-factor.spec.ts` - 2FA setup and login
2. ✅ `settings-password.spec.ts` - Password change
3. ✅ `auth-password-reset.spec.ts` - Password reset flow
4. ✅ `permissions-rbac.spec.ts` - Permission-based access control

### Phase 2: Admin Features (Week 2)
5. ✅ `admin-roles.spec.ts` - Role management
6. ✅ `admin-whatsapp.spec.ts` - WhatsApp settings
7. ✅ `admin-notifications.spec.ts` - Notification logs

### Phase 3: Core CRUD Operations (Week 3-4)
8. ✅ `items-crud.spec.ts` - Items management
9. ✅ `office-supplies.spec.ts` - Office supplies management
10. ✅ `office-requests.spec.ts` - Office request workflow

### Phase 4: Reports & Analytics (Week 5)
11. ✅ `reports-atk.spec.ts` - ATK reports generation
12. ✅ `reports-assets.spec.ts` - Asset reports
13. ✅ `reports-export.spec.ts` - PDF/Excel exports

### Phase 5: Edge Cases & Mobile (Week 6)
14. ✅ `mobile-responsive.spec.ts` - Mobile behavior
15. ✅ `offline-mode.spec.ts` - Offline functionality
16. ✅ `asset-maintenance.spec.ts` - Asset maintenance
17. ✅ `asset-photos.spec.ts` - Photo uploads

---

## Conclusion

This asset/persediaan management system has **14 major areas** missing E2E test coverage. The most critical gaps are in:

1. **Two-Factor Authentication** - Security-critical feature with zero tests
2. **RBAC/Permissions** - No verification that permissions work correctly
3. **Password Management** - No tests for password reset or change flows
4. **Admin Features** - Role and permission management are untested

Implementing the recommended tests will significantly improve system reliability, security, and maintainability.

---

**Generated by:** E2E Testing Specialist
**Next Steps:** Create test files following the priority order above.
