# data-test Attribute Standards

## Overview

`data-test` attributes provide stable, explicit selectors for E2E testing that are resilient to:
- Text content changes (i18n, rebranding)
- CSS class changes (design system updates)
- DOM structure changes (component refactoring)

---

## Naming Convention

### Format

```
{feature}-{element}-{type}
```

### Rules

1. **Use kebab-case** (lowercase with hyphens)
2. **Be descriptive** but concise
3. **Include context** (feature/module name)
4. **Use singular** nouns for elements
5. **Avoid redundant** prefixes

### Examples

| Element | Good | Bad |
|---------|------|-----|
| Submit button | `submit-button` | `btnSubmit`, `submit-btn`, `button-submit` |
| Email input | `email-input` | `input-email`, `emailField` |
| Delete dialog | `delete-dialog` | `modal-delete`, `deleteModal` |
| User menu | `user-menu` | `menu-user`, `userMenu` |

---

## Attribute Placement

### React Components

```tsx
// ✅ Good: Explicit data-test attribute
<button
  data-test="submit-button"
  onClick={handleSubmit}
>
  Submit
</button>

// ❌ Bad: Using CSS class for testing
<button
  className="btn-primary"
  onClick={handleSubmit}
>
  Submit
</button>
```

### With Dynamic Values

```tsx
// ✅ Good: Include ID for uniqueness
{items.map(item => (
  <tr key={item.id} data-test={`item-row-${item.id}`}>
    <td>{item.name}</td>
  </tr>
))}

// ✅ Good: Static attribute for container
<div data-test="items-table">
  {items.map(item => (
    <tr key={item.id}>
      <td>{item.name}</td>
    </tr>
  ))}
</div>
```

### Conditional Attributes

```tsx
// ✅ Good: Always include, even if hidden
<div
  data-test="error-message"
  className={error ? 'visible' : 'hidden'}
>
  {error}
</div>
```

---

## Component Standards

### Forms

```tsx
<form data-test="login-form">
  <input
    name="email"
    data-test="email-input"
    type="email"
  />
  <input
    name="password"
    data-test="password-input"
    type="password"
  />
  <button
    type="submit"
    data-test="submit-button"
  >
    Sign In
  </button>
</form>
```

### Buttons

```tsx
// Primary action
<button data-test="submit-button">Submit</button>

// Secondary action
<button data-test="cancel-button">Cancel</button>

// Destructive action
<button data-test="delete-button">Delete</button>

// Icon button
<button data-test="edit-button" aria-label="Edit">
  <EditIcon />
</button>
```

### Navigation

```tsx
<nav data-test="main-navigation">
  <Link href="/dashboard" data-test="dashboard-link">
    Dashboard
  </Link>
  <Link href="/items" data-test="items-link">
    Items
  </Link>
</nav>
```

### Tables

```tsx
<table data-test="items-table">
  <thead>
    <tr data-test="table-header">
      <th data-test="header-name">Name</th>
      <th data-test="header-category">Category</th>
      <th data-test="header-actions">Actions</th>
    </tr>
  </thead>
  <tbody>
    {items.map(item => (
      <tr key={item.id} data-test={`item-row-${item.id}`}>
        <td data-test="item-name">{item.name}</td>
        <td data-test="item-category">{item.category}</td>
        <td data-test="item-actions">
          <button data-test={`edit-item-${item.id}`}>Edit</button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

### Dialogs/Modals

```tsx
<Dialog data-test="delete-dialog">
  <DialogContent data-test="delete-dialog-content">
    <DialogHeader data-test="delete-dialog-header">
      <DialogTitle data-test="delete-dialog-title">
        Delete Item
      </DialogTitle>
    </DialogHeader>
    <DialogBody data-test="delete-dialog-body">
      Are you sure?
    </DialogBody>
    <DialogFooter data-test="delete-dialog-footer">
      <Button data-test="cancel-delete-button">Cancel</Button>
      <Button data-test="confirm-delete-button">Delete</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Lists/Cards

```tsx
<div data-test="items-list">
  {items.map(item => (
    <div key={item.id} data-test={`item-card-${item.id}`}>
      <h3 data-test="item-name">{item.name}</h3>
      <p data-test="item-description">{item.description}</p>
      <button data-test={`view-item-${item.id}`}>View</button>
    </div>
  ))}
</div>
```

### Menus/Dropdowns

```tsx
<Menu data-test="user-menu">
  <MenuButton data-test="user-menu-button">
    <UserIcon />
  </MenuButton>
  <MenuItems data-test="user-menu-items">
    <MenuItem data-test="profile-menu-item">
      Profile
    </MenuItem>
    <MenuItem data-test="settings-menu-item">
      Settings
    </MenuItem>
    <MenuItem data-test="logout-menu-item">
      Logout
    </MenuItem>
  </MenuItems>
</Menu>
```

---

## Testing with data-test Attributes

### Playwright Examples

```typescript
// Basic selector
await page.locator('[data-test="submit-button"]').click();

// With variable
const itemId = 123;
await page.locator(`[data-test="item-row-${itemId}"]`).click();

// Filter by data-test
await page.getByRole('button')
  .filter({ hasAttribute: 'data-test', value: 'submit-button' })
  .click();

// Get text content
const name = await page.locator('[data-test="item-name"]').textContent();

// Check visibility
await expect(page.locator('[data-test="error-message"]')).toBeVisible();

// Check if element exists
const hasButton = await page.locator('[data-test="submit-button"]').count() > 0;
```

### Before/After Comparison

```typescript
// ❌ Before: Brittle selector
await page.locator('.btn-primary').click();
// Breaks if CSS class changes

// ❌ Before: Brittle selector
await page.getByRole('button', { name: 'Submit' }).click();
// Breaks if text changes or translated

// ✅ After: Stable selector
await page.locator('[data-test="submit-button"]').click();
// Works regardless of styling or text changes
```

---

## Common Patterns

### Form Inputs

```tsx
<input
  name="email"
  data-test="email-input"
  type="email"
  required
/>
```

### Form Groups

```tsx
<div data-test="email-input-group">
  <label htmlFor="email">Email</label>
  <input
    id="email"
    name="email"
    data-test="email-input"
    type="email"
  />
  <span data-test="email-input-error">
    {errors.email}
  </span>
</div>
```

### Loading States

```tsx
<div data-test="items-container">
  {isLoading ? (
    <div data-test="loading-spinner">
      <Spinner />
    </div>
  ) : (
    <div data-test="items-list">
      {items.map(item => (
        <div key={item.id} data-test={`item-${item.id}`}>
          {item.name}
        </div>
      ))}
    </div>
  )}
</div>
```

### Empty States

```tsx
{items.length === 0 && (
  <div data-test="empty-state">
    <p data-test="empty-state-message">
      No items found
    </p>
    <button data-test="create-item-button">
      Create First Item
    </button>
  </div>
)}
```

### Error Messages

```tsx
{error && (
  <div data-test="error-message" role="alert">
    {error}
  </div>
)}

{errors.name && (
  <span data-test="name-input-error">
    {errors.name}
  </span>
)}
```

### Success Messages

```tsx
{success && (
  <div data-test="success-message" role="status">
    {success}
  </div>
)}
```

---

## Priority Implementation

### Critical (Implement First)

- Form submit buttons
- Form inputs (email, password, name)
- Navigation links
- Delete confirmation buttons
- Dialog/modal containers

### High Priority

- Table rows
- Action buttons (edit, delete, view)
- Error messages
- Success messages
- Loading indicators

### Medium Priority

- Menu items
- Card containers
- List items
- Filter controls
- Search inputs

### Low Priority

- Decorative elements
- Static content
- Icons without actions
- Layout containers

---

## Validation

### Automated Testing

We have a dedicated test file to validate data-test attributes:

```typescript
// tests/e2e/data-test-selectors.spec.ts
test.describe('Data-Test Selectors', () => {
  test('should have data-test attribute on submit button', async ({ page }) => {
    await page.goto('/form');
    await expect(page.locator('[data-test="submit-button"]')).toBeVisible();
  });
});
```

### Manual Checklist

When adding new components:

- [ ] Add `data-test` to all interactive elements
- [ ] Use kebab-case naming
- [ ] Include feature/module context
- [ ] Test with Playwright
- [ ] Document in component README

---

## Migration Strategy

### Step 1: Add to New Components

```tsx
// New components should always include data-test
<button data-test="submit-button">Submit</button>
```

### Step 2: Update Existing Components

```tsx
// Before
<button className="btn-primary">Submit</button>

// After
<button className="btn-primary" data-test="submit-button">Submit</button>
```

### Step 3: Update Tests

```typescript
// Before
await page.locator('.btn-primary').click();

// After
await page.locator('[data-test="submit-button"]').click();
```

### Step 4: Remove Old Selectors

```typescript
// Once all tests updated
// await page.locator('.btn-primary').click(); // Remove
```

---

## Best Practices

### DO

✅ Add `data-test` to all interactive elements
✅ Use descriptive, contextual names
✅ Follow kebab-case convention
✅ Include feature/module prefix
✅ Test selectors work before committing
✅ Document in component README

### DON'T

❌ Use CSS classes for testing
❌ Use dynamic IDs (e.g., `button-12345`)
❌ Use XPath selectors
❌ Use complex selectors
❌ Rely on text content
❌ Add `data-test` to decorative elements

---

## Examples by Feature

### Authentication

```tsx
<form data-test="login-form">
  <input data-test="email-input" name="email" />
  <input data-test="password-input" name="password" />
  <button data-test="submit-button">Sign In</button>
</form>
```

### Items CRUD

```tsx
<button data-test="create-item-button">Create Item</button>
<button data-test={`edit-item-${item.id}`}>Edit</button>
<button data-test={`delete-item-${item.id}`}>Delete</button>
```

### Office Usages

```tsx
<button data-test="log-usage-button">Log Usage</button>
<button data-test="quick-deduct-button">Quick Deduct</button>
<button data-test="usage-submit-button">Submit</button>
```

### Two-Factor Authentication

```tsx
<div data-test="2fa-setup-modal">
  <div data-test="2fa-qr-code">
    <img src={qrCodeUrl} alt="QR Code" />
  </div>
  <input data-test="totp-input" />
  <button data-test="verify-2fa-button">Verify</button>
</div>
```

### WhatsApp Settings

```tsx
<form data-test="whatsapp-settings-form">
  <input data-test="api-token-input" />
  <input data-test="sender-number-input" />
  <button data-test="test-whatsapp-button">Test</button>
  <button data-test="save-whatsapp-button">Save</button>
</form>
```

---

## Tooling

### VS Code Extension

Install "Data Test Attr" snippet library for quick insertion:

```json
{
  "Data Test Button": {
    "prefix": "dt-button",
    "body": ["data-test=\"${1:name}-button\""]
  },
  "Data Test Input": {
    "prefix": "dt-input",
    "body": ["data-test=\"${1:name}-input\""]
  }
}
```

### ESLint Plugin

Custom rule to enforce data-test on interactive elements:

```javascript
// .eslintrc.js
{
  rules: {
    'require-data-test': 'error'
  }
}
```

---

## Conclusion

Using `data-test` attributes consistently makes E2E tests:
- **More reliable** - Less likely to break with UI changes
- **Easier to maintain** - Clear, explicit selectors
- **Better documented** - Self-documenting test code
- **Faster to write** - Predictable selector patterns

---

**Last Updated:** 2025-01-12
**Status:** Active Standard
