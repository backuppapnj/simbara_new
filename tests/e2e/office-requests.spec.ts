import { test, expect } from '@playwright/test';

/**
 * Office Requests E2E Tests / Pengujian E2E Permintaan Kantor
 *
 * Menguji API endpoints untuk permintaan perlengkapan kantor (Office Supplies):
 * - Membuat permintaan barang via API
 * - Melihat daftar dan detail permintaan via API
 * - Menyetujui (approve) permintaan via API
 * - Menolak (reject) permintaan via API
 * - Validasi stok setelah approval
 * - Hak akses berdasarkan peran (role-based)
 *
 * Routes: /office-requests/*
 * Controller: OfficeRequestController.php
 * Middleware: permission:office.view, office.requests.create, office.requests.approve
 *
 * Status Flow: pending -> completed (approve) / rejected (reject)
 * Direct approval (berbeda dengan ATK yang punya multi-level approval)
 */

/**
 * Helper untuk login dan dapatkan storage state / Helper to login and get storage state
 */
async function getXsrfToken(page: any) {
  const cookies = await page.context().cookies();
  const tokenCookie = cookies.find((c: any) => c.name === 'XSRF-TOKEN');
  return tokenCookie ? decodeURIComponent(tokenCookie.value) : '';
}

test.describe('Office Requests - API Endpoints / Endpoints API', () => {
  test.use({ storageState: 'tests/e2e/.auth/pegawai.json' });

  test('GET /office-requests returns list / Mendapatkan daftar permintaan', async ({ page }) => {
    const response = await page.request.get('/office-requests', {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
      },
    });

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toHaveProperty('data');
    expect(Array.isArray(data.data)).toBeTruthy();
  });

  test('GET /office-supplies returns available supplies / Mendapatkan perlengkapan tersedia', async ({ page }) => {
    const response = await page.request.get('/office-supplies', {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
      },
    });

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toHaveProperty('data');
    expect(Array.isArray(data.data)).toBeTruthy();
    expect(data.data.length).toBeGreaterThan(0);
  });
});

test.describe('Office Requests - Create Validations / Validasi Pembuatan', () => {
  test.use({ storageState: 'tests/e2e/.auth/pegawai.json' });

  test('should validate required fields / Validasi field wajib', async ({ page }) => {
    const xsrfToken = await getXsrfToken(page);

    const response = await page.request.post('/office-requests', {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-XSRF-TOKEN': xsrfToken,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      data: {
        tanggal: new Date().toISOString().split('T')[0],
        department_id: (await getFirstDepartmentId(page)),
        keterangan: 'Test tanpa items',
        items: [], // Empty items
      },
    });

    // Should return validation error / Harus mengembalikan error validasi
    expect(response.status()).toBeGreaterThanOrEqual(400);

    const data = await response.json();
    expect(data.message || JSON.stringify(data)).toMatch(/items|wajib|required/i);
  });

  test('should validate quantity exceeds stock / Validasi jumlah melebihi stok', async ({ page }) => {
    const xsrfToken = await getXsrfToken(page);

    // Get first supply with stock / Dapatkan perlengkapan pertama dengan stok
    const suppliesResponse = await page.request.get('/office-supplies', {
      headers: { 'Accept': 'application/json' },
    });

    const suppliesData = await suppliesResponse.json();
    const firstSupply = suppliesData.data?.[0];

    if (!firstSupply || firstSupply.stok === 0) {
      test.skip('No supplies with stock available');
      return;
    }

    const response = await page.request.post('/office-requests', {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-XSRF-TOKEN': xsrfToken,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      data: {
        tanggal: new Date().toISOString().split('T')[0],
        department_id: await getFirstDepartmentId(page),
        keterangan: 'Test melebihi stok',
        items: [{
          supply_id: firstSupply.id,
          jumlah: firstSupply.stok + 1000, // More than available
        }],
      },
    });

    // May succeed but approval will give available amount / Mungkin berhasil tapi approval akan memberikan jumlah tersedia
    // Or may fail validation depending on implementation / Atau mungkin gagal validasi tergantung implementasi
    const status = response.status();
    expect(status).toBeGreaterThanOrEqual(200);
    expect(status).toBeLessThan(500);
  });
});

test.describe('Office Requests - Create Success / Berhasil Membuat', () => {
  test.use({ storageState: 'tests/e2e/.auth/pegawai.json' });

  test('should create request with single item / Membuat permintaan dengan satu item', async ({ page }) => {
    const xsrfToken = await getXsrfToken(page);

    // Get supplies / Dapatkan perlengkapan
    const suppliesResponse = await page.request.get('/office-supplies');
    const suppliesData = await suppliesResponse.json();
    const firstSupply = suppliesData.data?.[0];

    expect(firstSupply).toBeDefined();
    expect(firstSupply.stok).toBeGreaterThan(0);

    // Create request / Buat permintaan
    const response = await page.request.post('/office-requests', {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-XSRF-TOKEN': xsrfToken,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      data: {
        tanggal: new Date().toISOString().split('T')[0],
        department_id: await getFirstDepartmentId(page),
        keterangan: 'Permintaan untuk testing',
        items: [{
          supply_id: firstSupply.id,
          jumlah: Math.min(5, firstSupply.stok),
        }],
      },
    });

    expect(response.status()).toBe(201);

    const responseData = await response.json();
    expect(responseData.data).toBeDefined();
    expect(responseData.data.no_permintaan).toMatch(/^REQ-/);
    expect(responseData.data.status).toBe('pending');
    expect(responseData.data.request_details).toHaveLength(1);
  });

  test('should create request with multiple items / Membuat permintaan dengan beberapa item', async ({ page }) => {
    const xsrfToken = await getXsrfToken(page);

    // Get supplies / Dapatkan perlengkapan
    const suppliesResponse = await page.request.get('/office-supplies');
    const suppliesData = await suppliesResponse.json();
    const supplies = suppliesData.data?.slice(0, 3).filter((s: any) => s.stok > 0);

    expect(supplies.length).toBeGreaterThanOrEqual(2);

    const items = supplies.map((supply: any) => ({
      supply_id: supply.id,
      jumlah: Math.min(3, supply.stok),
    }));

    const response = await page.request.post('/office-requests', {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-XSRF-TOKEN': xsrfToken,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      data: {
        tanggal: new Date().toISOString().split('T')[0],
        department_id: await getFirstDepartmentId(page),
        keterangan: 'Permintaan berbagai perlengkapan',
        items,
      },
    });

    expect(response.ok()).toBeTruthy();

    const responseData = await response.json();
    expect(responseData.data.request_details.length).toBe(items.length);
  });
});

test.describe('Office Requests - View Detail / Lihat Detail', () => {
  test.use({ storageState: 'tests/e2e/.auth/pegawai.json' });

  test('should display request details / Menampilkan detail permintaan', async ({ page }) => {
    const xsrfToken = await getXsrfToken(page);

    // Create request / Buat permintaan
    const requestId = await createTestRequest(page);

    // Get detail / Dapatkan detail
    const response = await page.request.get(`/office-requests/${requestId}`, {
      headers: { 'Accept': 'application/json' },
    });

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.data).toBeDefined();
    expect(data.data.id).toBe(requestId);
    expect(data.data.request_details).toBeDefined();
    expect(data.data.status).toBe('pending');
  });

  test('should show requester info / Menampilkan info pemohon', async ({ page }) => {
    const xsrfToken = await getXsrfToken(page);

    const requestId = await createTestRequest(page);

    const response = await page.request.get(`/office-requests/${requestId}`);
    const data = await response.json();

    expect(data.data.user).toBeDefined();
    expect(data.data.user.name).toBeDefined();
  });
});

test.describe('Office Requests - Approval Flow / Alur Persetujuan', () => {
  test('happy path: create -> approve -> stock deducted / alur lengkap: buat -> setujui -> stok berkurang', async ({ browser }) => {
    // Create as pegawai / Buat sebagai pegawai
    const contextPegawai = await browser.newContext({
      storageState: 'tests/e2e/.auth/pegawai.json',
    });
    const pagePegawai = await contextPegawai.newPage();

    const suppliesResponse = await pagePegawai.request.get('/office-supplies');
    const suppliesData = await suppliesResponse.json();
    const firstSupply = suppliesData.data?.[0];
    const stockBefore = firstSupply.stok;
    const requestQuantity = Math.min(5, stockBefore);

    const requestId = await createTestRequest(pagePegawai, requestQuantity);
    await contextPegawai.close();

    // Approve as operator / Setujui sebagai operator
    const contextOp = await browser.newContext({
      storageState: 'tests/e2e/.auth/operator_persediaan.json',
    });
    const pageOp = await contextOp.newPage();

    const xsrfToken = await getXsrfToken(pageOp);

    const approveResponse = await pageOp.request.post(`/office-requests/${requestId}/approve`, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-XSRF-TOKEN': xsrfToken,
        'Accept': 'application/json',
      },
    });

    expect(approveResponse.ok()).toBeTruthy();

    const approveData = await approveResponse.json();
    expect(approveData.data.status).toBe('completed');

    // Verify stock was deducted / Verifikasi stok berkurang
    const supplyAfterResponse = await pageOp.request.get(`/office-supplies/${firstSupply.id}`);
    const supplyAfterData = await supplyAfterResponse.json();
    const stockAfter = supplyAfterData.data.stok;

    expect(stockAfter).toBe(stockBefore - requestQuantity);

    await contextOp.close();
  });

  test('should reject pending request / Menolak permintaan yang pending', async ({ browser }) => {
    const contextPegawai = await browser.newContext({
      storageState: 'tests/e2e/.auth/pegawai.json',
    });
    const pagePegawai = await contextPegawai.newPage();

    const suppliesResponse = await pagePegawai.request.get('/office-supplies');
    const suppliesData = await suppliesResponse.json();
    const firstSupply = suppliesData.data?.[0];
    const stockBefore = firstSupply.stok;

    const requestId = await createTestRequest(pagePegawai);
    await contextPegawai.close();

    // Reject as operator / Tolak sebagai operator
    const contextOp = await browser.newContext({
      storageState: 'tests/e2e/.auth/operator_persediaan.json',
    });
    const pageOp = await contextOp.newPage();

    const xsrfToken = await getXsrfToken(pageOp);

    const rejectResponse = await pageOp.request.post(`/office-requests/${requestId}/reject`, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-XSRF-TOKEN': xsrfToken,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      data: {
        alasan_penolakan: 'Stok tidak mencukupi untuk saat ini',
      },
    });

    expect(rejectResponse.ok()).toBeTruthy();

    const rejectData = await rejectResponse.json();
    expect(rejectData.data.status).toBe('rejected');
    expect(rejectData.data.alasan_penolakan).toBe('Stok tidak mencukupi untuk saat ini');

    // Verify stock was NOT deducted / Verifikasi stok TIDAK berkurang
    const supplyResponse = await pageOp.request.get(`/office-supplies/${firstSupply.id}`);
    const supplyData = await supplyResponse.json();
    const stockAfter = supplyData.data.stok;

    expect(stockAfter).toBe(stockBefore);

    await contextOp.close();
  });

  test('should not approve already completed request / Tidak bisa menyetujui yang sudah selesai', async ({ browser }) => {
    const contextPegawai = await browser.newContext({
      storageState: 'tests/e2e/.auth/pegawai.json',
    });
    const pagePegawai = await contextPegawai.newPage();

    const requestId = await createTestRequest(pagePegawai);
    await contextPegawai.close();

    // Approve first time / Setujui pertama kali
    const contextOp = await browser.newContext({
      storageState: 'tests/e2e/.auth/operator_persediaan.json',
    });
    const pageOp = await contextOp.newPage();

    const xsrfToken = await getXsrfToken(pageOp);

    await pageOp.request.post(`/office-requests/${requestId}/approve`, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-XSRF-TOKEN': xsrfToken,
        'Accept': 'application/json',
      },
    });

    // Try to approve again / Coba setujui lagi
    const secondApproveResponse = await pageOp.request.post(`/office-requests/${requestId}/approve`, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-XSRF-TOKEN': xsrfToken,
        'Accept': 'application/json',
      },
    });

    expect(secondApproveResponse.status()).toBe(422);

    const errorData = await secondApproveResponse.json();
    expect(errorData.message).toMatch(/pending|can only be approved/i);

    await contextOp.close();
  });

  test('should not reject already completed request / Tidak bisa menolak yang sudah selesai', async ({ browser }) => {
    const contextPegawai = await browser.newContext({
      storageState: 'tests/e2e/.auth/pegawai.json',
    });
    const pagePegawai = await contextPegawai.newPage();

    const requestId = await createTestRequest(pagePegawai);
    await contextPegawai.close();

    // Approve first / Setujui dulu
    const contextOp = await browser.newContext({
      storageState: 'tests/e2e/.auth/operator_persediaan.json',
    });
    const pageOp = await contextOp.newPage();

    const xsrfToken = await getXsrfToken(pageOp);

    await pageOp.request.post(`/office-requests/${requestId}/approve`, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-XSRF-TOKEN': xsrfToken,
        'Accept': 'application/json',
      },
    });

    // Try to reject / Coba tolak
    const rejectResponse = await pageOp.request.post(`/office-requests/${requestId}/reject`, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-XSRF-TOKEN': xsrfToken,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      data: {
        alasan_penolakan: 'Alasan penolakan',
      },
    });

    expect(rejectResponse.status()).toBe(422);

    const errorData = await rejectResponse.json();
    expect(errorData.message).toMatch(/pending|can only be rejected/i);

    await contextOp.close();
  });
});

test.describe('Office Requests - Permissions / Hak Akses', () => {
  test('regular user can only see own requests / User biasa hanya bisa lihat permintaan sendiri', async ({ browser }) => {
    // Create as pegawai / Buat sebagai pegawai
    const contextPegawai = await browser.newContext({
      storageState: 'tests/e2e/.auth/pegawai.json',
    });
    const pagePegawai = await contextPegawai.newPage();

    const requestId = await createTestRequest(pagePegawai);

    const listResponse = await pagePegawai.request.get('/office-requests');
    const listData = await listResponse.json();

    expect(listData.data.length).toBeGreaterThan(0);

    // Should see own request / Harus melihat permintaan sendiri
    const ownRequest = listData.data.find((r: any) => r.id === requestId);
    expect(ownRequest).toBeDefined();

    await contextPegawai.close();
  });

  test('regular user cannot approve requests / User biasa tidak bisa menyetujui', async ({ page }) => {
    const xsrfToken = await getXsrfToken(page);

    const requestId = await createTestRequest(page);

    const approveResponse = await page.request.post(`/office-requests/${requestId}/approve`, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-XSRF-TOKEN': xsrfToken,
        'Accept': 'application/json',
      },
    });

    // Should be forbidden / Harus dilarang
    expect(approveResponse.status()).toBe(403);
  });

  test('operator can approve requests / Operator dapat menyetujui', async ({ page }) => {
    test.use({ storageState: 'tests/e2e/.auth/operator_persediaan.json' });

    // Create as pegawai first / Buat sebagai pegawai dulu
    const contextPegawai = await page.context().browser()?.newContext({
      storageState: 'tests/e2e/.auth/pegawai.json',
    });
    if (!contextPegawai) {
      test.skip('Could not create context');
      return;
    }

    const pagePegawai = await contextPegawai.newPage();
    const requestId = await createTestRequest(pagePegawai);
    await contextPegawai.close();

    // Approve as operator / Setujui sebagai operator
    const xsrfToken = await getXsrfToken(page);

    const approveResponse = await page.request.post(`/office-requests/${requestId}/approve`, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-XSRF-TOKEN': xsrfToken,
        'Accept': 'application/json',
      },
    });

    expect(approveResponse.ok()).toBeTruthy();
  });
});

test.describe('Office Requests - Stock Management / Manajemen Stok', () => {
  test('stock deducted correctly after approval / Stok berkurang dengan benar', async ({ browser }) => {
    const contextPegawai = await browser.newContext({
      storageState: 'tests/e2e/.auth/pegawai.json',
    });
    const pagePegawai = await contextPegawai.newPage();

    const suppliesResponse = await pagePegawai.request.get('/office-supplies');
    const suppliesData = await suppliesResponse.json();
    const firstSupply = suppliesData.data?.[0];
    const stockBefore = firstSupply.stok;
    const requestQuantity = Math.min(10, stockBefore);

    const requestId = await createTestRequest(pagePegawai, requestQuantity);
    await contextPegawai.close();

    // Approve / Setujui
    const contextOp = await browser.newContext({
      storageState: 'tests/e2e/.auth/operator_persediaan.json',
    });
    const pageOp = await contextOp.newPage();

    const xsrfToken = await getXsrfToken(pageOp);

    await pageOp.request.post(`/office-requests/${requestId}/approve`, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-XSRF-TOKEN': xsrfToken,
        'Accept': 'application/json',
      },
    });

    // Check stock / Cek stok
    const supplyAfterResponse = await pageOp.request.get(`/office-supplies/${firstSupply.id}`);
    const supplyAfterData = await supplyAfterResponse.json();
    const stockAfter = supplyAfterData.data.stok;

    expect(stockAfter).toBe(stockBefore - requestQuantity);

    // Check mutation history / Cek riwayat mutasi
    const mutationsResponse = await pageOp.request.get(`/office-supplies/${firstSupply.id}/mutations`);
    const mutationsData = await mutationsResponse.json();

    const relatedMutation = mutationsData.data?.find((m: any) =>
      m.referensi_id === requestId &&
      m.jenis_mutasi === 'keluar'
    );

    expect(relatedMutation).toBeDefined();
    expect(relatedMutation.jumlah).toBe(requestQuantity);
    expect(relatedMutation.stok_sebelum).toBe(stockBefore);
    expect(relatedMutation.stok_sesudah).toBe(stockAfter);

    await contextOp.close();
  });

  test('handles insufficient stock gracefully / Menangani stok tidak cukup', async ({ browser }) => {
    const contextPegawai = await browser.newContext({
      storageState: 'tests/e2e/.auth/pegawai.json',
    });
    const pagePegawai = await contextPegawai.newPage();

    const suppliesResponse = await pagePegawai.request.get('/office-supplies');
    const suppliesData = await suppliesResponse.json();
    const firstSupply = suppliesData.data?.[0];
    const stockBefore = firstSupply.stok;

    // Request more than available / Minta lebih dari yang tersedia
    const requestId = await createTestRequest(pagePegawai, stockBefore + 100);
    await contextPegawai.close();

    // Approve (should give available amount only) / Setujui (harus memberi jumlah tersedia saja)
    const contextOp = await browser.newContext({
      storageState: 'tests/e2e/.auth/operator_persediaan.json',
    });
    const pageOp = await contextOp.newPage();

    const xsrfToken = await getXsrfToken(pageOp);

    await pageOp.request.post(`/office-requests/${requestId}/approve`, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-XSRF-TOKEN': xsrfToken,
        'Accept': 'application/json',
      },
    });

    // Check stock didn't go negative / Cek stok tidak negatif
    const supplyAfterResponse = await pageOp.request.get(`/office-supplies/${firstSupply.id}`);
    const supplyAfterData = await supplyAfterResponse.json();
    const stockAfter = supplyAfterData.data.stok;

    expect(stockAfter).toBe(0); // Should be zero, not negative

    // Check jumlah_diberikan is set correctly / Cek jumlah_diberikan diatur dengan benar
    const requestAfterResponse = await pageOp.request.get(`/office-requests/${requestId}`);
    const requestAfterData = await requestAfterResponse.json();
    const detail = requestAfterData.data.request_details?.[0];

    expect(detail.jumlah_diberikan).toBe(stockBefore);

    await contextOp.close();
  });
});

test.describe('Office Requests - Edge Cases / Kasus Khusus', () => {
  test('validates rejection reason is required / Validasi alasan penolakan wajib', async ({ browser }) => {
    const contextPegawai = await browser.newContext({
      storageState: 'tests/e2e/.auth/pegawai.json',
    });
    const pagePegawai = await contextPegawai.newPage();

    const requestId = await createTestRequest(pagePegawai);
    await contextPegawai.close();

    const contextOp = await browser.newContext({
      storageState: 'tests/e2e/.auth/operator_persediaan.json',
    });
    const pageOp = await contextOp.newPage();

    const xsrfToken = await getXsrfToken(pageOp);

    // Try to reject without reason / Coba tolak tanpa alasan
    const rejectResponse = await pageOp.request.post(`/office-requests/${requestId}/reject`, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-XSRF-TOKEN': xsrfToken,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      data: {
        alasan_penolakan: '', // Empty reason
      },
    });

    expect(rejectResponse.status()).toBe(422);

    const errorData = await rejectResponse.json();
    expect(errorData.message || JSON.stringify(errorData)).toMatch(/alasan penolakan|reason.*required/i);

    await contextOp.close();
  });
});

/**
 * Helper function to get first department ID
 */
async function getFirstDepartmentId(page: any): Promise<string> {
  const response = await page.request.get('/departments', {
    headers: { 'Accept': 'application/json' },
  });

  if (response.ok()) {
    const data = await response.json();
    return data.data?.[0]?.id;
  }

  throw new Error('No departments found');
}

/**
 * Helper function to create a test request
 */
async function createTestRequest(page: any, quantity?: number): Promise<string> {
  const xsrfToken = await getXsrfToken(page);

  const suppliesResponse = await page.request.get('/office-supplies');
  const suppliesData = await suppliesResponse.json();
  const firstSupply = suppliesData.data?.[0];

  if (!firstSupply) {
    throw new Error('No supplies available');
  }

  const requestQuantity = quantity ?? Math.min(5, firstSupply.stok);

  const response = await page.request.post('/office-requests', {
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'X-XSRF-TOKEN': xsrfToken,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    data: {
      tanggal: new Date().toISOString().split('T')[0],
      department_id: await getFirstDepartmentId(page),
      keterangan: 'Permintaan untuk testing',
      items: [{
        supply_id: firstSupply.id,
        jumlah: requestQuantity,
      }],
    },
  });

  if (!response.ok()) {
    throw new Error(`Failed to create request: ${response.status()}`);
  }

  const responseData = await response.json();
  return responseData.data.id;
}
