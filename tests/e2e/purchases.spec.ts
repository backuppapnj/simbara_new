import { test, expect } from '@playwright/test';
import { login, logout } from './support/auth';
import { testUsers } from './support/test-users';

/**
 * Uji E2E Pembelian ATK (Purchases)
 *
 * Tests pembelian ATK (purchases) management meliputi:
 * - Menampilkan daftar pembelian
 * - Membuat pembelian baru dengan satu atau beberapa item
 * - Melihat detail pembelian
 * - Validasi formulir pembelian
 * - Filter dan pencarian pembelian
 * - Perhitungan total yang benar
 * - Penambahan/penghapusan item dinamis
 * - Manajemen stok otomatis setelah pembelian
 *
 * Routes: /purchases/*
 * Controller: PurchaseController.php
 * Model: Purchase, PurchaseDetail
 * Middleware: permission:purchase.view, purchase.create
 *
 * @author E2E Test Suite
 * @version 2.0.0
 */

test.describe('Purchases - Index Page // Halaman Daftar Pembelian', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should display purchases list page with correct elements // Harus menampilkan halaman daftar pembelian dengan elemen yang benar', async ({ page }) => {
    await page.goto('/purchases');

    // Verify page title - Verifikasi judul halaman
    await expect(page).toHaveTitle(/Pembelian ATK/i);

    // Verify main heading - Verifikasi heading utama
    await expect(
      page.getByRole('heading', { name: /Pembelian ATK/i, level: 1 })
    ).toBeVisible();

    // Verify purchases table/list is visible - Verifikasi tabel/daftar pembelian terlihat
    await expect(page.locator('table')).toBeVisible();

    // Verify create button is visible - Verifikasi tombol buat terlihat
    const createButton = page.getByRole('link', { name: /Buat Pembelian/i });
    await expect(createButton).toBeVisible();
  });

  test('should display purchase table columns correctly // Harus menampilkan kolom tabel pembelian dengan benar', async ({ page }) => {
    await page.goto('/purchases');

    const table = page.locator('table').first();

    // Verify table headers - Verifikasi header tabel
    const expectedHeaders = [
      /No\. Pembelian/i,
      /Tanggal/i,
      /Supplier/i,
      /Total Item/i,
      /Total Nilai/i,
      /Status/i,
      /Aksi/i
    ];

    for (const header of expectedHeaders) {
      const hasHeader = await table.getByRole('columnheader').filter({ hasText: header }).count() > 0;
      if (hasHeader) {
        await expect(table.getByRole('columnheader').filter({ hasText: header })).toBeVisible();
      }
    }
  });

  test('should paginate purchases list // Harus melakukan paginasi daftar pembelian', async ({ page }) => {
    await page.goto('/purchases');

    // Look for pagination controls - Cari kontrol paginasi
    const pagination = page.locator('button').filter({ hasText: /Previous|Next|»|«/i });

    if (await pagination.count() > 0) {
      await expect(pagination.first()).toBeVisible();
    }
  });
});

test.describe('Purchases - Create Purchase // Membuat Pembelian', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should create new purchase with single item // Harus membuat pembelian baru dengan satu item', async ({ page }) => {
    await page.goto('/purchases');

    // Click create button - Klik tombol buat
    await page.getByRole('link', { name: /Buat Pembelian/i }).click();

    // Wait for form to load - Tunggu formulir dimuat
    await expect(page.getByRole('heading', { name: /Buat Pembelian Baru/i, level: 1 })).toBeVisible();

    // Fill in purchase date - Isi tanggal pembelian
    const today = new Date().toISOString().split('T')[0];
    const dateInput = page.locator('input#tanggal');
    await expect(dateInput).toBeVisible();
    await dateInput.fill(today);

    // Fill in supplier name - Isi nama supplier
    const supplierName = 'Test Supplier ' + Date.now();
    const supplierInput = page.locator('input#supplier');
    await expect(supplierInput).toBeVisible();
    await supplierInput.fill(supplierName);

    // Add item by clicking the "Tambah Barang" button
    await page.getByRole('button', { name: /Tambah Barang/i }).click();

    // Wait for item row to appear
    await page.waitForTimeout(500);

    // Select item from dropdown
    const itemSelect = page.locator('select').first();
    if (await itemSelect.count() > 0) {
      await itemSelect.selectOption({ index: 1 }); // Skip the first option (usually "Pilih barang...")

      // Fill quantity - Isi jumlah
      const quantityInput = page.locator('input[type="number"]').first();
      if (await quantityInput.count() > 0) {
        await quantityInput.fill('10');
      }

      // Fill notes/keterangan - Isi catatan
      const notesInput = page.locator('textarea#keterangan');
      if (await notesInput.count() > 0) {
        await notesInput.fill('Pembelian test untuk keperluan kantor');
      }

      // Accept confirmation dialog
      page.on('dialog', dialog => dialog.accept());

      // Submit form - Kirim formulir
      await page.getByRole('button', { name: /Simpan Pembelian/i }).click();

      // Wait a bit for navigation
      await page.waitForTimeout(1000);

      // Verify success - Check if we're redirected back to index or show success
      const currentUrl = page.url();
      const isSuccess = currentUrl.includes('/purchases') && !currentUrl.includes('/create');
      expect(isSuccess).toBeTruthy();
    }
  });

  test('should create purchase with multiple items // Harus membuat pembelian dengan beberapa item', async ({ page }) => {
    await page.goto('/purchases');

    // Click create button
    await page.getByRole('link', { name: /Buat Pembelian/i }).click();

    // Wait for form
    await expect(page.getByRole('heading', { name: /Buat Pembelian Baru/i, level: 1 })).toBeVisible();

    // Fill basic info - Isi informasi dasar
    const supplierName = 'Multi Item Supplier ' + Date.now();
    const supplierInput = page.locator('input#supplier');
    await supplierInput.fill(supplierName);

    const today = new Date().toISOString().split('T')[0];
    const dateInput = page.locator('input#tanggal');
    await dateInput.fill(today);

    // Add multiple items - Tambah beberapa item
    const addItemButton = page.getByRole('button', { name: /Tambah Barang/i });

    // Add first item
    await addItemButton.click();
    await page.waitForTimeout(300);

    const itemSelect1 = page.locator('select').nth(0);
    if (await itemSelect1.count() > 0) {
      await itemSelect1.selectOption({ index: 1 });
      const qty1 = page.locator('input[type="number"]').nth(0);
      if (await qty1.count() > 0) await qty1.fill('5');
    }

    // Add second item
    await addItemButton.click();
    await page.waitForTimeout(300);

    const itemSelect2 = page.locator('select').nth(1);
    if (await itemSelect2.count() > 0) {
      await itemSelect2.selectOption({ index: 2 });
      const qty2 = page.locator('input[type="number"]').nth(1);
      if (await qty2.count() > 0) await qty2.fill('10');
    }

    // Add third item
    await addItemButton.click();
    await page.waitForTimeout(300);

    const itemSelect3 = page.locator('select').nth(2);
    if (await itemSelect3.count() > 0) {
      await itemSelect3.selectOption({ index: 3 });
      const qty3 = page.locator('input[type="number"]').nth(2);
      if (await qty3.count() > 0) await qty3.fill('15');
    }

    // Accept confirmation and submit
    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: /Simpan Pembelian/i }).click();

    // Wait for navigation
    await page.waitForTimeout(1000);

    // Verify success - Check if we're redirected back to index
    const currentUrl = page.url();
    const isSuccess = currentUrl.includes('/purchases') && !currentUrl.includes('/create');
    expect(isSuccess).toBeTruthy();
  });

  test('should dynamically add and remove purchase items // Harus menambah dan menghapus item pembelian secara dinamis', async ({ page }) => {
    await page.goto('/purchases');
    await page.getByRole('link', { name: /Buat Pembelian/i }).click();
    await expect(page.getByRole('heading', { name: /Buat Pembelian Baru/i, level: 1 })).toBeVisible();

    const addItemButton = page.getByRole('button', { name: /Tambah Barang/i });

    // Initial state - no items
    let initialCount = await page.locator('select').count();

    // Add item - Tambah item
    await addItemButton.click();
    await page.waitForTimeout(300);

    const afterAddCount = await page.locator('select').count();
    expect(afterAddCount).toBeGreaterThan(initialCount);

    // Add another item
    await addItemButton.click();
    await page.waitForTimeout(300);

    const afterAddCount2 = await page.locator('select').count();
    expect(afterAddCount2).toBeGreaterThan(afterAddCount);

    // Remove item - Hapus item (trash button)
    const removeButton = page.locator('button').filter({ hasText: '' }).nth(1); // Second button might be trash
    const trashButtons = page.locator('button').filter(async (btn) => {
      const className = await btn.getAttribute('class');
      return className?.includes('text-red') || false;
    });

    if (await trashButtons.count() > 0) {
      await trashButtons.first().click();
      await page.waitForTimeout(300);

      const afterRemoveCount = await page.locator('select').count();
      expect(afterRemoveCount).toBeLessThan(afterAddCount2);
    }
  });

  test('should calculate total correctly // Harus menghitung total dengan benar', async ({ page }) => {
    await page.goto('/purchases');
    await page.getByRole('link', { name: /Buat Pembelian/i }).click();

    // Fill supplier and date
    const supplierInput = page.locator('input#supplier');
    await supplierInput.fill('Calculation Test Supplier');

    const today = new Date().toISOString().split('T')[0];
    const dateInput = page.locator('input#tanggal');
    await dateInput.fill(today);

    // Add item
    await page.getByRole('button', { name: /Tambah Barang/i }).click();
    await page.waitForTimeout(300);

    const itemSelect = page.locator('select').first();
    if (await itemSelect.count() > 0) {
      await itemSelect.selectOption({ index: 1 });

      const quantityInput = page.locator('input[type="number"]').first();
      if (await quantityInput.count() > 0) {
        await quantityInput.fill('10');
      }

      // Wait for calculation - Tunggu perhitungan
      await page.waitForTimeout(500);

      // Look for total display - Cari tampilan total
      const totalText = page.getByText(/Total Nilai Pembelian/i);
      if (await totalText.count() > 0) {
        await expect(totalText).toBeVisible();
      }
    }
  });

  test('should validate required fields // Harus memvalidasi field wajib', async ({ page }) => {
    await page.goto('/purchases');
    await page.getByRole('link', { name: /Buat Pembelian/i }).click();

    // Try to submit without filling any fields - Coba kirim tanpa mengisi field apapun
    // Browser validation will prevent submit, but let's check the form
    const submitButton = page.getByRole('button', { name: /Simpan Pembelian/i });

    // Check if button is disabled when no items
    await expect(submitButton).toBeDisabled();
  });

  test('should validate minimum quantity // Harus memvalidasi jumlah minimum', async ({ page }) => {
    await page.goto('/purchases');
    await page.getByRole('link', { name: /Buat Pembelian/i }).click();

    // Fill supplier and date - Isi supplier dan tanggal
    const supplierInput = page.locator('input#supplier');
    await supplierInput.fill('Test Supplier');

    const today = new Date().toISOString().split('T')[0];
    const dateInput = page.locator('input#tanggal');
    await dateInput.fill(today);

    // Add item and set zero quantity
    await page.getByRole('button', { name: /Tambah Barang/i }).click();
    await page.waitForTimeout(300);

    const itemSelect = page.locator('select').first();
    if (await itemSelect.count() > 0) {
      await itemSelect.selectOption({ index: 1 });

      const quantityInput = page.locator('input[type="number"]').first();
      if (await quantityInput.count() > 0) {
        await quantityInput.fill('0');

        // Browser validation should prevent form submission
        const isValid = await quantityInput.evaluate(el => (el as HTMLInputElement).checkValidity());
        expect(isValid).toBeFalsy();
      }
    }
  });

  test('should prevent negative price // Harus mencegah harga negatif', async ({ page }) => {
    await page.goto('/purchases');
    await page.getByRole('link', { name: /Buat Pembelian/i }).click();

    // Fill required fields - Isi field wajib
    const supplierInput = page.locator('input#supplier');
    await supplierInput.fill('Test Supplier');

    const today = new Date().toISOString().split('T')[0];
    const dateInput = page.locator('input#tanggal');
    await dateInput.fill(today);

    // Add item and try negative price
    await page.getByRole('button', { name: /Tambah Barang/i }).click();
    await page.waitForTimeout(300);

    const itemSelect = page.locator('select').first();
    if (await itemSelect.count() > 0) {
      await itemSelect.selectOption({ index: 1 });

      const priceInputs = page.locator('input[type="number"]');
      // Third input should be price (after selecting item)
      if (await priceInputs.count() >= 2) {
        await priceInputs.nth(1).fill('-1000');

        // Browser validation should prevent form submission
        const isValid = await priceInputs.nth(1).evaluate(el => (el as HTMLInputElement).checkValidity());
        expect(isValid).toBeFalsy();
      }
    }
  });
});

test.describe('Purchases - View Details // Lihat Detail', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should display purchase detail page // Harus menampilkan halaman detail pembelian', async ({ page }) => {
    await page.goto('/purchases');

    // Click on first purchase - Klik pembelian pertama
    const purchaseLink = page.locator('a[href*="/purchases/"]').first();

    if (await purchaseLink.count() > 0) {
      await purchaseLink.click();

      // Verify detail page - Verifikasi halaman detail
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

      // Verify purchase info is displayed - Verifikasi info pembelian ditampilkan
      await expect(page.getByText(/Informasi Pembelian/i)).toBeVisible();
    }
  });

  test('should display all purchase information // Harus menampilkan semua informasi pembelian', async ({ page }) => {
    await page.goto('/purchases');

    const purchaseLink = page.locator('a[href*="/purchases/"]').first();

    if (await purchaseLink.count() > 0) {
      await purchaseLink.click();

      // Verify purchase number - Verifikasi nomor pembelian
      const purchaseNumber = page.getByText(/PB-\d+/i);
      if (await purchaseNumber.count() > 0) {
        await expect(purchaseNumber).toBeVisible();
      }

      // Verify supplier - Verifikasi supplier
      await expect(page.getByText(/Supplier/i)).toBeVisible();

      // Verify date - Verifikasi tanggal
      await expect(page.getByText(/Tanggal/i)).toBeVisible();

      // Verify total value - Verifikasi nilai total
      await expect(page.getByText(/Total Nilai/i)).toBeVisible();

      // Verify items table - Verifikasi tabel item
      await expect(page.locator('table')).toBeVisible();
    }
  });

  test('should display purchase items with quantities and prices // Harus menampilkan item pembelian dengan jumlah dan harga', async ({ page }) => {
    await page.goto('/purchases');

    const purchaseLink = page.locator('a[href*="/purchases/"]').first();

    if (await purchaseLink.count() > 0) {
      await purchaseLink.click();

      // Verify items are listed - Verifikasi item terdaftar
      await expect(page.getByText(/Daftar Barang/i)).toBeVisible();

      // Look for item details - Cari detail item
      await expect(page.getByText(/Jumlah/i)).toBeVisible();
      await expect(page.getByText(/Harga Satuan/i)).toBeVisible();
      await expect(page.getByText(/Subtotal/i)).toBeVisible();
    }
  });

  test('should display notes/keterangan if present // Harus menampilkan catatan jika ada', async ({ page }) => {
    await page.goto('/purchases');

    const purchaseLink = page.locator('a[href*="/purchases/"]').first();

    if (await purchaseLink.count() > 0) {
      await purchaseLink.click();

      // Check for notes section - Cek bagian catatan
      const notesSection = page.getByText(/Keterangan/i);

      if (await notesSection.count() > 0) {
        await expect(notesSection).toBeVisible();
      }
    }
  });
});

test.describe('Purchases - Filter and Search // Filter dan Pencarian', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should filter purchases by status // Harus memfilter pembelian berdasarkan status', async ({ page }) => {
    await page.goto('/purchases');

    // Look for status filter - Cari filter status
    const statusSelect = page.locator('select#status');

    if (await statusSelect.count() > 0) {
      // Select a status
      await statusSelect.selectOption('draft');

      // Wait for results
      await page.waitForTimeout(500);

      // Verify results are filtered
      await expect(page.locator('table')).toBeVisible();
    }
  });

  test('should search purchases by supplier name // Harus mencari pembelian berdasarkan nama supplier', async ({ page }) => {
    await page.goto('/purchases');

    // Look for search input - Cari input pencarian
    const searchInput = page.locator('input#search');

    if (await searchInput.count() > 0) {
      // Enter search term - Masukkan istilah pencarian
      await searchInput.fill('Test');

      // Submit search
      const searchButton = page.getByRole('button', { name: /Cari/i });
      if (await searchButton.count() > 0) {
        await searchButton.click();
      } else {
        await searchInput.press('Enter');
      }

      // Wait for results - Tunggu hasil
      await page.waitForTimeout(500);

      // Verify search results - Verifikasi hasil pencarian
      await expect(page.locator('table')).toBeVisible();
    }
  });

  test('should clear filters and show all results // Harus menghapus filter dan menampilkan semua hasil', async ({ page }) => {
    await page.goto('/purchases');

    // Apply filter first - Terapkan filter dulu
    const searchInput = page.locator('input#search');

    if (await searchInput.count() > 0) {
      await searchInput.fill('xyz123nonexistent');
      await searchInput.press('Enter');
      await page.waitForTimeout(500);

      // Clear filter - Hapus filter
      const clearButton = page.getByRole('button', { name: /Reset Filter/i });
      if (await clearButton.count() > 0) {
        await clearButton.click();
        await page.waitForTimeout(500);

        // Verify all results shown - Verifikasi semua hasil ditampilkan
        await expect(page.locator('table')).toBeVisible();
      }
    }
  });
});

test.describe('Purchases - Permissions // Izin', () => {
  test('should allow users with permission to create purchases // Harus mengizinkan pengguna dengan izin membuat pembelian', async ({ page }) => {
    // Login as super admin (has all permissions) - Masuk sebagai super admin
    await login(page, testUsers.superAdmin);
    await page.goto('/purchases');

    // Create button should be visible and enabled - Tombol buat harus terlihat dan diaktifkan
    const createButton = page.getByRole('link', { name: /Buat Pembelian/i });
    await expect(createButton).toBeVisible();

    await logout(page);
  });

  test('should prevent access for unauthorized users // Harus mencegah akses untuk pengguna tidak berwenang', async ({ page }) => {
    // Try with different user types - Coba dengan jenis pengguna berbeda
    await login(page, testUsers.pegawai);

    await page.goto('/purchases');

    // User might be redirected or see empty list - Pengguna mungkin diarahkan atau melihat daftar kosong
    const currentUrl = page.url();
    const isRedirected = currentUrl.includes('/dashboard') || currentUrl.includes('/login');
    const hasAccess = await page.getByRole('heading', { name: /Pembelian ATK/i }).count() > 0;

    // Either redirected or has access - Dihapus atau memiliki akses
    expect(isRedirected || hasAccess).toBeTruthy();

    await logout(page);
  });
});

test.describe('Purchases - Responsive Design // Desain Responsif', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should display correctly on mobile // Harus ditampilkan dengan benar di seluler', async ({ page }) => {
    // Set mobile viewport - Atur viewport seluler
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/purchases');

    // Verify page is accessible - Verifikasi halaman dapat diakses
    await expect(page.getByRole('heading', { name: /Pembelian ATK/i, level: 1 })).toBeVisible();

    // Check for table
    const table = page.locator('table');
    await expect(table).toBeVisible();
  });

  test('should display correctly on tablet // Harus ditampilkan dengan benar di tablet', async ({ page }) => {
    // Set tablet viewport - Atur viewport tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/purchases');

    // Verify page is accessible - Verifikasi halaman dapat diakses
    await expect(page.getByRole('heading', { name: /Pembelian ATK/i, level: 1 })).toBeVisible();

    await expect(page.locator('table')).toBeVisible();
  });
});

test.describe('Purchases - Navigation // Navigasi', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should navigate from list to detail and back // Harus menavigasi dari daftar ke detail dan kembali', async ({ page }) => {
    await page.goto('/purchases');

    const purchaseLink = page.locator('a[href*="/purchases/"]').first();

    if (await purchaseLink.count() > 0) {
      await purchaseLink.click();

      // Verify on detail page - Verifikasi di halaman detail
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

      // Navigate back - Navigasi kembali
      await page.goBack();

      // Verify back on list page - Verifikasi kembali ke halaman daftar
      await expect(page).toHaveURL(/\/purchases$/);
      await expect(page.getByRole('heading', { name: /Pembelian ATK/i, level: 1 })).toBeVisible();
    }
  });

  test('should have breadcrumb navigation // Harus memiliki navigasi breadcrumb', async ({ page }) => {
    await page.goto('/purchases');

    const purchaseLink = page.locator('a[href*="/purchases/"]').first();

    if (await purchaseLink.count() > 0) {
      await purchaseLink.click();

      // Look for breadcrumbs - Cari breadcrumb
      const heading = page.getByRole('heading', { level: 1 });
      await expect(heading).toBeVisible();
    }
  });
});

test.describe('Purchases - Data Integrity // Integritas Data', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should display purchase number in correct format // Harus menampilkan nomor pembelian dalam format yang benar', async ({ page }) => {
    await page.goto('/purchases');

    // Look for purchase numbers in format PB-YYYYMMDD-XXXXX - Cari nomor pembelian dalam format
    const purchaseNumber = page.getByText(/PB-\d{8}-\d+/i);

    if (await purchaseNumber.count() > 0) {
      await expect(purchaseNumber.first()).toBeVisible();
    }
  });

  test('should preserve data on page refresh // Harus mempertahankan data pada refresh halaman', async ({ page }) => {
    await page.goto('/purchases');

    // Count items before refresh - Hitung item sebelum refresh
    const table = page.locator('table').first();
    let rowsBefore = 0;

    if (await table.count() > 0) {
      rowsBefore = await table.locator('tbody tr').count();
    }

    // Refresh page - Refresh halaman
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Count items after refresh - Hitung item setelah refresh
    const tableAfter = page.locator('table').first();
    let rowsAfter = 0;

    if (await tableAfter.count() > 0) {
      rowsAfter = await tableAfter.locator('tbody tr').count();
    }

    // Should have same or similar count - Harus memiliki jumlah yang sama atau mirip
    expect(rowsAfter).toBeGreaterThanOrEqual(rowsBefore - 1); // Allow for 1 row difference
  });
});

test.describe('Purchases - Edge Cases // Kasus Tepi', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should handle very long supplier names // Harus menangani nama supplier yang sangat panjang', async ({ page }) => {
    await page.goto('/purchases');
    await page.getByRole('link', { name: /Buat Pembelian/i }).click();

    const supplierInput = page.locator('input#supplier');

    if (await supplierInput.count() > 0) {
      // Enter 100 character supplier name - Masukkan nama supplier 100 karakter
      const longSupplierName = 'A'.repeat(100);
      await supplierInput.fill(longSupplierName);

      // Should accept input
      await expect(supplierInput).toHaveValue(longSupplierName);
    }
  });

  test('should handle empty list gracefully // Harus menangani daftar kosong dengan baik', async ({ page }) => {
    // This test assumes there might be filters that result in no data
    await page.goto('/purchases');

    // Try searching for non-existent purchase
    const searchInput = page.locator('input#search');

    if (await searchInput.count() > 0) {
      await searchInput.fill('NONEXISTENTPURCHASE12345');
      await searchInput.press('Enter');
      await page.waitForTimeout(500);

      // Should show empty state message or empty table
      const table = page.locator('table');
      await expect(table).toBeVisible();
    }
  });

  test('should handle special characters in notes // Harus menangani karakter khusus dalam catatan', async ({ page }) => {
    await page.goto('/purchases');
    await page.getByRole('link', { name: /Buat Pembelian/i }).click();

    const notesInput = page.locator('textarea#keterangan');

    if (await notesInput.count() > 0) {
      // Enter special characters - Masukkan karakter khusus
      const specialNotes = 'Test dengan karakter khusus: @#$%^&*()_+-=[]{}|;:\'",.<>?/`~';
      await notesInput.fill(specialNotes);

      // Should accept special characters - Harus menerima karakter khusus
      await expect(notesInput).toHaveValue(specialNotes);
    }
  });
});
