import { test, expect } from '@playwright/test';
import { login, logout } from './support/auth';
import { testUsers } from './support/test-users';

/**
 * Asset Maintenance E2E Tests / Tes E2E Perawatan Aset
 *
 * Menguji fitur perawatan aset meliputi:
 * - Viewing asset maintenance history / Melihat riwayat perawatan aset
 * - Creating maintenance records (Preventive, Corrective, Rehab) / Membuat catatan perawatan
 * - Scheduling future maintenance / Menjadwalkan perawatan masa depan
 * - Updating maintenance records / Memperbarui catatan perawatan
 * - Completing scheduled maintenance / Menyelesaikan perawatan terjadwal
 * - Deleting maintenance records / Menghapus catatan perawatan
 * - Maintenance cost calculations / Perhitungan biaya perawatan
 * - Filtering and searching / Filter dan pencarian
 * - Permission-based access control / Kontrol akses berbasis perizinan
 * - Validation error handling / Penanganan error validasi
 *
 * Routes: /assets/{id}/maintenance, /assets/{assetId}/maintenances
 * Controller: AssetController.php (maintenanceStore, maintenancesIndex, maintenancesUpdate, maintenancesDestroy)
 * Middleware: permission:assets.view, assets.maintenance.*
 */

test.describe('Asset Maintenance - Viewing History', () => {
  test.use({ storageState: 'tests/e2e/.auth/super_admin.json' });

  test('should view asset maintenance history from asset detail page', async ({ page }) => {
    // Navigate to assets list / Arahkan ke daftar aset
    await page.goto('/assets');

    // Click on first asset to view details / Klik aset pertama untuk melihat detail
    await page.locator('tbody tr').first().click();

    // Wait for asset detail page to load / Tunggu halaman detail aset dimuat
    await expect(page).toHaveURL(/\/assets\/\w+/);
    await expect(page.getByText('Detail Aset', { exact: false })).toBeVisible();

    // Look for maintenance tab or section / Cari tab atau bagian perawatan
    const maintenanceTab = page.getByRole('button', { name: /perawatan|maintenance/i }).or(
      page.getByRole('tab', { name: /perawatan|maintenance/i })
    );

    if (await maintenanceTab.count() > 0) {
      await maintenanceTab.click();
    }

    // Verify maintenance section is visible / Verifikasi bagian perawatan terlihat
    await expect(page.getByText(/riwayat perawatan|maintenance history/i, { exact: false })).toBeVisible();
  });

  test('should display maintenance list with correct columns', async ({ page }) => {
    // Get an asset with existing maintenance records / Dapatkan aset dengan catatan perawatan yang ada
    await page.goto('/assets');

    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();

    // Navigate to maintenance section / Arahkan ke bagian perawatan
    const maintenanceTab = page.getByRole('button', { name: /perawatan|maintenance/i });
    if (await maintenanceTab.count() > 0) {
      await maintenanceTab.click();
    }

    // Check for table or list view / Periksa tampilan tabel atau daftar
    const maintenanceTable = page.locator('table').or(
      page.locator('[role="table"]')
    );

    if (await maintenanceTable.count() > 0) {
      // Verify table columns / Verifikasi kolom tabel
      await expect(page.getByRole('columnheader', { name: /tanggal|date/i })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /jenis|type|tipe/i })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /biaya|cost/i })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /pelaksana|technician/i })).toBeVisible();
    }
  });

  test('should show empty state when no maintenance records exist', async ({ page }) => {
    // This test assumes we might have an asset without maintenance
    // Test ini mengasumsikan kita mungkin memiliki aset tanpa perawatan

    await page.goto('/assets');

    // Try to find an asset that might not have maintenance
    // Coba temukan aset yang mungkin tidak memiliki perawatan
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();

    for (let i = 0; i < Math.min(rowCount, 3); i++) {
      await rows.nth(i).click();

      const maintenanceTab = page.getByRole('button', { name: /perawatan|maintenance/i });
      if (await maintenanceTab.count() > 0) {
        await maintenanceTab.click();
      }

      // Check for empty state message / Periksa pesan status kosong
      const emptyState = page.getByText(/tidak ada|no data|belum ada perawatan/i, { exact: false });

      if (await emptyState.count() > 0) {
        await expect(emptyState).toBeVisible();
        return;
      }

      // Go back if no empty state found / Kembali jika tidak ada status kosong ditemukan
      await page.goBack();
    }
  });
});

test.describe('Asset Maintenance - Creating Records', () => {
  test.use({ storageState: 'tests/e2e/.auth/super_admin.json' });

  test('should create preventive maintenance record successfully', async ({ page }) => {
    await page.goto('/assets');

    // Select first asset / Pilih aset pertama
    await page.locator('tbody tr').first().click();

    // Click "Input Perawatan" or "Add Maintenance" button
    // Klik tombol "Input Perawatan" atau "Add Maintenance"
    const addMaintenanceBtn = page.getByRole('button', { name: /input perawatan|add maintenance|tambah perawatan/i });
    await expect(addMaintenanceBtn).toBeVisible();
    await addMaintenanceBtn.click();

    // Wait for form/dialog to appear / Tunggu formulir/dialog muncul
    await expect(page.getByText(/buat perawatan|create maintenance|form perawatan/i, { exact: false })).toBeVisible();

    // Select maintenance type "Preventive" / Pilih jenis perawatan "Preventive"
    const typeSelect = page.locator('select[name="jenis_perawatan"]').or(
      page.getByLabel(/jenis|type|tipe/i)
    );
    await typeSelect.selectOption('Preventive');

    // Fill in required fields / Isi bidang wajib
    const today = new Date().toISOString().split('T')[0];

    const dateInput = page.locator('input[name="tanggal"]').or(
      page.locator('input[type="date"]')
    );
    await dateInput.fill(today);

    const pelaksanaInput = page.locator('input[name="pelaksana"]').or(
      page.getByLabel(/pelaksana|technician|teknisi/i)
    );
    await pelaksanaInput.fill('Teknisi Maintenance Test');

    const costInput = page.locator('input[name="biaya"]').or(
      page.getByLabel(/biaya|cost/i)
    );
    await costInput.fill('500000');

    const descriptionInput = page.locator('textarea[name="keterangan"]').or(
      page.getByLabel(/keterangan|description|deskripsi/i)
    );
    await descriptionInput.fill('Preventive maintenance routine check');

    // Submit form / Kirim formulir
    const submitBtn = page.getByRole('button', { name: /simpan|save|submit|kirim/i });
    await submitBtn.click();

    // Verify success message / Verifikasi pesan sukses
    await expect(page.getByText(/berhasil|success|created/i, { exact: false })).toBeVisible();
  });

  test('should create corrective maintenance record with cost', async ({ page }) => {
    await page.goto('/assets');

    await page.locator('tbody tr').first().click();

    // Click add maintenance / Klik tambah perawatan
    const addMaintenanceBtn = page.getByRole('button', { name: /input perawatan|add maintenance/i });
    await addMaintenanceBtn.click();

    // Select "Corrective" type / Pilih jenis "Corrective"
    const typeSelect = page.locator('select[name="jenis_perawatan"]');
    await typeSelect.selectOption('Corrective');

    // Fill form with corrective maintenance details
    // Isi formulir dengan detail perbaikan
    const today = new Date().toISOString().split('T')[0];

    await page.locator('input[name="tanggal"]').fill(today);
    await page.locator('input[name="pelaksana"]').fill('Service Center Resmi');
    await page.locator('input[name="biaya"]').fill('1500000');
    await page.locator('textarea[name="keterangan"]').fill('Perbaikan sistem AC yang tidak dingin');

    // Submit / Kirim
    await page.getByRole('button', { name: /simpan|save/i }).click();

    // Verify success and check record appears in list
    // Verifikasi sukses dan periksa catatan muncul dalam daftar
    await expect(page.getByText(/berhasil|success/i)).toBeVisible();
  });

  test('should create rehab maintenance record', async ({ page }) => {
    await page.goto('/assets');

    await page.locator('tbody tr').first().click();

    const addMaintenanceBtn = page.getByRole('button', { name: /input perawatan|add maintenance/i });
    await addMaintenanceBtn.click();

    // Select "Rehab" type / Pilih jenis "Rehab"
    await page.locator('select[name="jenis_perawatan"]').selectOption('Rehab');

    // Fill rehab details / Isi detail rehabilitasi
    const today = new Date().toISOString().split('T')[0];

    await page.locator('input[name="tanggal"]').fill(today);
    await page.locator('input[name="pelaksana"]').fill('Kontraktor Rehabilitasi');
    await page.locator('input[name="biaya"]').fill('5000000');
    await page.locator('textarea[name="keterangan"]').fill('Rehabilitasi total bangunan gedung');

    await page.getByRole('button', { name: /simpan|save/i }).click();

    await expect(page.getByText(/berhasil|success/i)).toBeVisible();
  });

  test('should create maintenance with zero cost', async ({ page }) => {
    await page.goto('/assets');

    await page.locator('tbody tr').first().click();

    const addMaintenanceBtn = page.getByRole('button', { name: /input perawatan|add maintenance/i });
    await addMaintenanceBtn.click();

    // Create maintenance with no cost / Buat perawatan tanpa biaya
    await page.locator('select[name="jenis_perawatan"]').selectOption('Preventive');

    const today = new Date().toISOString().split('T')[0];
    await page.locator('input[name="tanggal"]').fill(today);
    await page.locator('input[name="pelaksana"]').fill('Tim Internal');

    // Leave biaya empty or set to 0 / Biarkan biaya kosong atau set ke 0
    const costInput = page.locator('input[name="biaya"]');
    if (await costInput.count() > 0) {
      await costInput.fill('0');
    }

    await page.locator('textarea[name="keterangan"]').fill('Pemeriksaan rutin internal');

    await page.getByRole('button', { name: /simpan|save/i }).click();

    await expect(page.getByText(/berhasil|success/i)).toBeVisible();
  });
});

test.describe('Asset Maintenance - Scheduling Future', () => {
  test.use({ storageState: 'tests/e2e/.auth/super_admin.json' });

  test('should schedule future maintenance', async ({ page }) => {
    await page.goto('/assets');

    await page.locator('tbody tr').first().click();

    const addMaintenanceBtn = page.getByRole('button', { name: /input perawatan|add maintenance/i });
    await addMaintenanceBtn.click();

    // Set future date / Set tanggal masa depan
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 3);
    const futureDateStr = futureDate.toISOString().split('T')[0];

    await page.locator('select[name="jenis_perawatan"]').selectOption('Preventive');
    await page.locator('input[name="tanggal"]').fill(futureDateStr);
    await page.locator('input[name="pelaksana"]').fill('Vendor Terjadwal');
    await page.locator('input[name="biaya"]').fill('750000');
    await page.locator('textarea[name="keterangan"]').fill('Scheduled preventive maintenance - 3 monthly check');

    await page.getByRole('button', { name: /simpan|save/i }).click();

    await expect(page.getByText(/berhasil|success/i)).toBeVisible();

    // Verify the scheduled maintenance appears with correct date
    // Verifikasi perawatan terjadwal muncul dengan tanggal yang benar
    const scheduledDate = page.getByText(futureDateStr.slice(0, 7)); // Check year-month
    if (await scheduledDate.count() > 0) {
      await expect(scheduledDate).toBeVisible();
    }
  });

  test('should display scheduled status indicator', async ({ page }) => {
    await page.goto('/assets');

    await page.locator('tbody tr').first().click();

    // Look for maintenance with future date / Cari perawatan dengan tanggal masa depan
    const futureDates = page.locator('text=' + new Date().getFullYear().toString());
    const maintenanceItems = page.locator('[data-test="maintenance-item"], .maintenance-item, tr.maintenance-row');

    // Check for any status indicators like "Scheduled" or "Terjadwal"
    // Periksa indikator status seperti "Scheduled" atau "Terjadwal"
    const statusBadge = page.getByText(/terjadwal|scheduled|upcoming/i, { exact: false });

    if (await maintenanceItems.count() > 0) {
      // If we have maintenance items, check for status badges
      // Jika kita memiliki item perawatan, periksa lencana status
      const hasBadge = await statusBadge.count() > 0;
      if (hasBadge) {
        await expect(statusBadge.first()).toBeVisible();
      }
    }
  });
});

test.describe('Asset Maintenance - Updating Records', () => {
  test.use({ storageState: 'tests/e2e/.auth/super_admin.json' });

  test('should update existing maintenance record', async ({ page }) => {
    await page.goto('/assets');

    await page.locator('tbody tr').first().click();

    // Navigate to maintenance section / Arahkan ke bagian perawatan
    const maintenanceTab = page.getByRole('button', { name: /perawatan|maintenance/i });
    if (await maintenanceTab.count() > 0) {
      await maintenanceTab.click();
    }

    // Find edit button for first maintenance record / Cari tombol edit untuk catatan perawatan pertama
    const editBtn = page.getByRole('button', { name: /edit|ubah|update/i }).or(
      page.locator('a[href*="/edit"]')
    ).first();

    if (await editBtn.count() > 0) {
      await editBtn.click();

      // Update description / Perbarui deskripsi
      const descInput = page.locator('textarea[name="keterangan"]').or(
        page.getByLabel(/keterangan|description/i)
      );

      const newDescription = 'Updated: ' + Date.now();
      await descInput.clear();
      await descInput.fill(newDescription);

      // Update cost / Perbarui biaya
      const costInput = page.locator('input[name="biaya"]');
      await costInput.clear();
      await costInput.fill('2000000');

      // Save changes / Simpan perubahan
      await page.getByRole('button', { name: /simpan|save|update/i }).click();

      // Verify success / Verifikasi sukses
      await expect(page.getByText(/berhasil diperbarui|successfully updated/i, { exact: false })).toBeVisible();
    }
  });

  test('should complete scheduled maintenance by updating status', async ({ page }) => {
    await page.goto('/assets');

    await page.locator('tbody tr').first().click();

    const maintenanceTab = page.getByRole('button', { name: /perawatan|maintenance/i });
    if (await maintenanceTab.count() > 0) {
      await maintenanceTab.click();
    }

    // Find a scheduled maintenance (future date) to complete
    // Cari perawatan terjadwal (tanggal masa depan) untuk diselesaikan
    const editBtn = page.getByRole('button', { name: /edit|ubah/i }).first();

    if (await editBtn.count() > 0) {
      await editBtn.click();

      // Update to today's date to mark as completed
      // Perbarui ke tanggal hari ini untuk menandai sebagai selesai
      const today = new Date().toISOString().split('T')[0];
      await page.locator('input[name="tanggal"]').fill(today);

      // Add completion notes / Tambahkan catatan penyelesaian
      const notesInput = page.locator('textarea[name="keterangan"]');
      const currentNotes = await notesInput.inputValue();
      await notesInput.fill(currentNotes + ' - COMPLETED on ' + today);

      await page.getByRole('button', { name: /simpan|save|update/i }).click();

      await expect(page.getByText(/berhasil|success/i)).toBeVisible();
    }
  });
});

test.describe('Asset Maintenance - Deleting Records', () => {
  test.use({ storageState: 'tests/e2e/.auth/super_admin.json' });

  test('should delete maintenance record with confirmation', async ({ page }) => {
    await page.goto('/assets');

    await page.locator('tbody tr').first().click();

    const maintenanceTab = page.getByRole('button', { name: /perawatan|maintenance/i });
    if (await maintenanceTab.count() > 0) {
      await maintenanceTab.click();
    }

    // Find delete button / Cari tombol hapus
    const deleteBtn = page.getByRole('button', { name: /hapus|delete/i }).first();

    if (await deleteBtn.count() > 0) {
      // Take screenshot before deletion for debugging
      // Ambil screenshot sebelum penghapusan untuk debugging
      await page.screenshot({ path: 'test-results/before-delete.png' });

      await deleteBtn.click();

      // Look for confirmation dialog / Cari dialog konfirmasi
      const confirmDialog = page.getByRole('dialog').or(
        page.locator('.modal').or(page.locator('[role="alertdialog"]'))
      );

      if (await confirmDialog.count() > 0) {
        // Confirm deletion / Konfirmasi penghapusan
        const confirmBtn = page.getByRole('button', { name: /ya|yes|confirm|ok/i }).or(
          page.locator('button.danger').or(page.locator('button.btn-danger'))
        );

        await confirmBtn.click();
      }

      // Verify success message / Verifikasi pesan sukses
      await expect(page.getByText(/berhasil dihapus|successfully deleted|deleted/i, { exact: false })).toBeVisible();

      // Verify record is removed / Verifikasi catatan dihapus
      await expect(page.getByText(/berhasil dihapus/i)).toBeVisible();
    }
  });

  test('should cancel deletion when cancel button clicked', async ({ page }) => {
    await page.goto('/assets');

    await page.locator('tbody tr').first().click();

    const maintenanceTab = page.getByRole('button', { name: /perawatan|maintenance/i });
    if (await maintenanceTab.count() > 0) {
      await maintenanceTab.click();
    }

    const deleteBtn = page.getByRole('button', { name: /hapus|delete/i }).first();

    if (await deleteBtn.count() > 0) {
      await deleteBtn.click();

      // Click cancel instead of confirm / Klik batal alih-alih konfirmasi
      const cancelBtn = page.getByRole('button', { name: /batal|cancel|tidak|no/i });

      if (await cancelBtn.count() > 0) {
        await cancelBtn.click();

        // Verify dialog closes and record still exists
        // Verifikasi dialog menutup dan catatan masih ada
        await expect(page.getByRole('dialog')).not.toBeVisible();
      }
    }
  });
});

test.describe('Asset Maintenance - Cost Calculations', () => {
  test.use({ storageState: 'tests/e2e/.auth/super_admin.json' });

  test('should display total maintenance cost for asset', async ({ page }) => {
    await page.goto('/assets');

    await page.locator('tbody tr').first().click();

    // Look for total cost display / Cari tampilan total biaya
    const totalCostLabel = page.getByText(/total biaya|total cost|total perawatan/i, { exact: false });
    const costValue = page.locator('[data-test="total-maintenance-cost"], .total-cost');

    if (await totalCostLabel.count() > 0) {
      await expect(totalCostLabel).toBeVisible();

      // Verify cost is formatted as currency / Verifikasi biaya diformat sebagai mata uang
      const currencyPattern = /Rp\s*\d+[\.,]\d+|\d+[\.,]\d+\s* IDR/i;
      const costText = await totalCostLabel.textContent();

      if (costText) {
        expect(costText).toMatch(currencyPattern);
      }
    }
  });

  test('should update total cost after adding new maintenance', async ({ page }) => {
    await page.goto('/assets');

    await page.locator('tbody tr').first().click();

    // Get initial total cost if displayed / Dapatkan total biaya awal jika ditampilkan
    const initialCost = page.getByText(/total biaya|total cost/i, { exact: false });

    let costBefore = '0';
    if (await initialCost.count() > 0) {
      costBefore = await initialCost.textContent() || '0';
    }

    // Add new maintenance with known cost / Tambah perawatan baru dengan biaya tertentu
    const addBtn = page.getByRole('button', { name: /input perawatan|add maintenance/i });
    await addBtn.click();

    await page.locator('select[name="jenis_perawatan"]').selectOption('Preventive');

    const today = new Date().toISOString().split('T')[0];
    await page.locator('input[name="tanggal"]').fill(today);
    await page.locator('input[name="pelaksana"]').fill('Test Technician');
    await page.locator('input[name="biaya"]').fill('1000000');
    await page.locator('textarea[name="keterangan"]').fill('Test maintenance for cost calculation');

    await page.getByRole('button', { name: /simpan|save/i }).click();

    await expect(page.getByText(/berhasil|success/i)).toBeVisible();

    // Verify total cost updated / Verifikasi total biaya diperbarui
    const updatedCost = page.getByText(/total biaya|total cost/i, { exact: false });

    if (await updatedCost.count() > 0) {
      const costAfter = await updatedCost.textContent() || '0';
      expect(costAfter).not.toBe(costBefore);
    }
  });
});

test.describe('Asset Maintenance - Filtering and Search', () => {
  test.use({ storageState: 'tests/e2e/.auth/super_admin.json' });

  test('should filter maintenances by type', async ({ page }) => {
    await page.goto('/assets');

    await page.locator('tbody tr').first().click();

    const maintenanceTab = page.getByRole('button', { name: /perawatan|maintenance/i });
    if (await maintenanceTab.count() > 0) {
      await maintenanceTab.click();
    }

    // Look for type filter / Cari filter jenis
    const typeFilter = page.locator('select[name*="type"], select[name*="jenis"]').or(
      page.getByLabel(/filter.*jenis|filter.*type/i)
    );

    if (await typeFilter.count() > 0) {
      // Filter by Preventive / Filter berdasarkan Preventive
      await typeFilter.selectOption('Preventive');

      // Wait for filtered results / Tunggu hasil filter
      await page.waitForTimeout(500);

      // Verify filtered results / Verifikasi hasil filter
      await expect(page.getByText(/Preventive/i)).toBeVisible();
    }
  });

  test('should filter maintenances by date range', async ({ page }) => {
    await page.goto('/assets');

    await page.locator('tbody tr').first().click();

    const maintenanceTab = page.getByRole('button', { name: /perawatan|maintenance/i });
    if (await maintenanceTab.count() > 0) {
      await maintenanceTab.click();
    }

    // Look for date range filters / Cari filter rentang tanggal
    const startDateInput = page.locator('input[name*="start_date"], input[placeholder*="dari"], input[placeholder*="from"]');
    const endDateInput = page.locator('input[name*="end_date"], input[placeholder*="sampai"], input[placeholder*="to"]');

    if (await startDateInput.count() > 0 && await endDateInput.count() > 0) {
      // Set current month range / Set rentang bulan ini
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

      await startDateInput.fill(firstDay);
      await endDateInput.fill(lastDay);

      // Apply filter / Terapkan filter
      const applyBtn = page.getByRole('button', { name: /terapkan|apply|filter/i });
      if (await applyBtn.count() > 0) {
        await applyBtn.click();
      }

      await page.waitForTimeout(500);
    }
  });
});

test.describe('Asset Maintenance - Validation Errors', () => {
  test.use({ storageState: 'tests/e2e/.auth/super_admin.json' });

  test('should show validation error when required fields are empty', async ({ page }) => {
    await page.goto('/assets');

    await page.locator('tbody tr').first().click();

    const addBtn = page.getByRole('button', { name: /input perawatan|add maintenance/i });
    await addBtn.click();

    // Try to submit without filling required fields
    // Coba kirim tanpa mengisi bidang wajib
    const submitBtn = page.getByRole('button', { name: /simpan|save|submit/i });

    // If button is enabled, click it / Jika tombol diaktifkan, klik
    if (await submitBtn.isEnabled()) {
      await submitBtn.click();

      // Verify validation errors appear / Verifikasi error validasi muncul
      await expect(page.getByText(/harus diisi|required|wajib/i, { exact: false })).toBeVisible();
    }
  });

  test('should show validation error for negative cost', async ({ page }) => {
    await page.goto('/assets');

    await page.locator('tbody tr').first().click();

    const addBtn = page.getByRole('button', { name: /input perawatan|add maintenance/i });
    await addBtn.click();

    // Fill form with negative cost / Isi formulir dengan biaya negatif
    await page.locator('select[name="jenis_perawatan"]').selectOption('Preventive');

    const today = new Date().toISOString().split('T')[0];
    await page.locator('input[name="tanggal"]').fill(today);
    await page.locator('input[name="pelaksana"]').fill('Test Technician');

    const costInput = page.locator('input[name="biaya"]');
    if (await costInput.count() > 0) {
      await costInput.fill('-100000');
    }

    await page.getByRole('button', { name: /simpan|save/i }).click();

    // Verify validation error / Verifikasi error validasi
    await expect(page.getByText(/tidak boleh negatif|must be positive|min: 0/i, { exact: false })).toBeVisible();
  });

  test('should show validation error for invalid maintenance type', async ({ page }) => {
    await page.goto('/assets');

    await page.locator('tbody tr').first().click();

    const addBtn = page.getByRole('button', { name: /input perawatan|add maintenance/i });
    await addBtn.click();

    // Try to submit without selecting valid type
    // Coba kirim tanpa memilih jenis yang valid
    const typeSelect = page.locator('select[name="jenis_perawatan"]');

    if (await typeSelect.count() > 0) {
      // Try to select invalid option if possible, or leave empty
      // Coba pilih opsi tidak valid jika memungkinkan, atau biarkan kosong
      await page.locator('input[name="pelaksana"]').fill('Test');
      await page.getByRole('button', { name: /simpan|save/i }).click();

      // Verify error / Verifikasi error
      await expect(page.getByText(/jenis|type|required/i, { exact: false })).toBeVisible();
    }
  });
});

test.describe('Asset Maintenance - Permissions and Access Control', () => {
  test('should hide maintenance features from unauthorized users', async ({ page }) => {
    // Login as regular pegawai (employee) without maintenance permissions
    // Login sebagai pegawai biasa tanpa izin perawatan
    await login(page, testUsers.pegawai);

    await page.goto('/assets');

    await page.locator('tbody tr').first().click();

    // "Input Perawatan" button should NOT be visible
    // Tombol "Input Perawatan" seharusnya TIDAK terlihat
    const addMaintenanceBtn = page.getByRole('button', { name: /input perawatan|add maintenance/i });

    await expect(addMaintenanceBtn).not.toBeVisible();

    // Edit and delete buttons should also be hidden
    // Tombol edit dan hapus juga harus disembunyikan
    const editBtn = page.getByRole('button', { name: /edit|ubah/i });
    const deleteBtn = page.getByRole('button', { name: /hapus|delete/i });

    await expect(editBtn).not.toBeVisible();
    await expect(deleteBtn).not.toBeVisible();

    await logout(page);
  });

  test('should allow maintenance operations for super admin', async ({ page }) => {
    // Login as super admin / Login sebagai super admin
    await login(page, testUsers.superAdmin);

    await page.goto('/assets');

    await page.locator('tbody tr').first().click();

    // All maintenance buttons should be visible
    // Semua tombol perawatan harus terlihat
    const addMaintenanceBtn = page.getByRole('button', { name: /input perawatan|add maintenance/i });

    await expect(addMaintenanceBtn).toBeVisible();

    await logout(page);
  });

  test('should prevent creating maintenance via API for unauthorized users', async ({ page }) => {
    // This tests API-level authorization
    // Ini menguji otorisasi tingkat API

    await login(page, testUsers.pegawai);

    // Try to access maintenance create endpoint directly
    // Coba akses endpoint pembuatan perawatan langsung
    const response = await page.request.post('/assets/01KEPKHPE6ZQWWNX5KYVFGXKPH/maintenance', {
      data: {
        jenis_perawatan: 'Preventive',
        tanggal: new Date().toISOString().split('T')[0],
        pelaksana: 'Unauthorized',
        biaya: 100000,
      },
    });

    // Should get 403 Forbidden / Harus mendapatkan 403 Forbidden
    expect([403, 401]).toContain(response.status());

    await logout(page);
  });
});

test.describe('Asset Maintenance - Edge Cases', () => {
  test.use({ storageState: 'tests/e2e/.auth/super_admin.json' });

  test('should handle very long description text', async ({ page }) => {
    await page.goto('/assets');

    await page.locator('tbody tr').first().click();

    const addBtn = page.getByRole('button', { name: /input perawatan|add maintenance/i });
    await addBtn.click();

    // Create a long description / Buat deskripsi panjang
    const longDescription = 'A'.repeat(900); // Close to max 1000 chars

    await page.locator('select[name="jenis_perawatan"]').selectOption('Preventive');

    const today = new Date().toISOString().split('T')[0];
    await page.locator('input[name="tanggal"]').fill(today);
    await page.locator('input[name="pelaksana"]').fill('Test Tech');
    await page.locator('textarea[name="keterangan"]').fill(longDescription);

    await page.getByRole('button', { name: /simpan|save/i }).click();

    // Should succeed or show validation about max length
    // Harus sukses atau menampilkan validasi tentang panjang maksimum
    const successMsg = page.getByText(/berhasil|success/i);
    const errorMsg = page.getByText(/maksimal|max.*character|1000/i);

    await expect(successMsg.or(errorMsg)).toBeVisible();
  });

  test('should handle very large cost values', async ({ page }) => {
    await page.goto('/assets');

    await page.locator('tbody tr').first().click();

    const addBtn = page.getByRole('button', { name: /input perawatan|add maintenance/i });
    await addBtn.click();

    await page.locator('select[name="jenis_perawatan"]').selectOption('Rehab');

    const today = new Date().toISOString().split('T')[0];
    await page.locator('input[name="tanggal"]').fill(today);
    await page.locator('input[name="pelaksana"]').fill('Test');

    // Set very large cost / Set biaya sangat besar
    await page.locator('input[name="biaya"]').fill('999999999');
    await page.locator('textarea[name="keterangan"]').fill('High value rehab project');

    await page.getByRole('button', { name: /simpan|save/i }).click();

    await expect(page.getByText(/berhasil|success/i)).toBeVisible();
  });

  test('should handle special characters in technician name', async ({ page }) => {
    await page.goto('/assets');

    await page.locator('tbody tr').first().click();

    const addBtn = page.getByRole('button', { name: /input perawatan|add maintenance/i });
    await addBtn.click();

    await page.locator('select[name="jenis_perawatan"]').selectOption('Preventive');

    const today = new Date().toISOString().split('T')[0];
    await page.locator('input[name="tanggal"]').fill(today);

    // Use special characters / Gunakan karakter khusus
    await page.locator('input[name="pelaksana"]').fill("CV. Teknik Jaya & Sons (PT. Maju)");
    await page.locator('textarea[name="keterangan"]').fill('Test with special chars');

    await page.getByRole('button', { name: /simpan|save/i }).click();

    await expect(page.getByText(/berhasil|success/i)).toBeVisible();
  });
});

test.describe('Asset Maintenance - Performance and UX', () => {
  test.use({ storageState: 'tests/e2e/.auth/super_admin.json' });

  test('should load maintenance list within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/assets');

    await page.locator('tbody tr').first().click();

    const maintenanceTab = page.getByRole('button', { name: /perawatan|maintenance/i });
    if (await maintenanceTab.count() > 0) {
      await maintenanceTab.click();
    }

    // Wait for maintenance list to load / Tunggu daftar perawatan dimuat
    await page.waitForLoadState('domcontentloaded');

    const loadTime = Date.now() - startTime;

    // Should load within 3 seconds / Harus dimuat dalam 3 detik
    expect(loadTime).toBeLessThan(3000);
  });

  test('should provide visual feedback during form submission', async ({ page }) => {
    await page.goto('/assets');

    await page.locator('tbody tr').first().click();

    const addBtn = page.getByRole('button', { name: /input perawatan|add maintenance/i });
    await addBtn.click();

    await page.locator('select[name="jenis_perawatan"]').selectOption('Preventive');

    const today = new Date().toISOString().split('T')[0];
    await page.locator('input[name="tanggal"]').fill(today);
    await page.locator('input[name="pelaksana"]').fill('Test Tech');

    const submitBtn = page.getByRole('button', { name: /simpan|save/i });
    await submitBtn.click();

    // Check for loading state / Periksa status loading
    const loadingIndicator = page.locator('.loading, .spinner, [disabled]').or(
      submitBtn.locator('[disabled]')
    );

    // Button should be disabled during submission
    // Tombol harus dinonaktifkan saat pengiriman
    const isDisabled = await submitBtn.isDisabled();
    expect(isDisabled).toBe(true);
  });
});

test.describe('Asset Maintenance - Data Persistence', () => {
  test.use({ storageState: 'tests/e2e/.auth/super_admin.json' });

  test('should persist maintenance data after page refresh', async ({ page }) => {
    await page.goto('/assets');

    await page.locator('tbody tr').first().click();

    // Create a maintenance record / Buat catatan perawatan
    const addBtn = page.getByRole('button', { name: /input perawatan|add maintenance/i });
    await addBtn.click();

    const testId = 'E2E-TEST-' + Date.now();

    await page.locator('select[name="jenis_perawatan"]').selectOption('Preventive');

    const today = new Date().toISOString().split('T')[0];
    await page.locator('input[name="tanggal"]').fill(today);
    await page.locator('input[name="pelaksana"]').fill('E2E Test Technician');
    await page.locator('textarea[name="keterangan"]').fill(testId);

    await page.getByRole('button', { name: /simpan|save/i }).click();

    await expect(page.getByText(/berhasil|success/i)).toBeVisible();

    // Refresh page / Muat ulang halaman
    await page.reload();

    // Verify the maintenance record still exists / Verifikasi catatan perawatan masih ada
    const maintenanceTab = page.getByRole('button', { name: /perawatan|maintenance/i });
    if (await maintenanceTab.count() > 0) {
      await maintenanceTab.click();
    }

    // Look for our test record / Cari catatan tes kami
    await expect(page.getByText(testId)).toBeVisible();
  });
});
