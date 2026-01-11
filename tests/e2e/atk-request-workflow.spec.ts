import { test, expect, type Page } from '@playwright/test';

async function getXsrfHeaders(page: Page) {
  const cookies = await page.context().cookies();
  const tokenCookie = cookies.find((c) => c.name === 'XSRF-TOKEN');
  const xsrfToken = tokenCookie ? decodeURIComponent(tokenCookie.value) : '';

  return {
    'X-Requested-With': 'XMLHttpRequest',
    'X-XSRF-TOKEN': xsrfToken,
    Accept: 'application/json',
  };
}

test.describe('ATK Request Workflow', () => {
  test.describe('Validation', () => {
    test.use({ storageState: 'tests/e2e/.auth/pegawai.json' });

    test('validates stock on request creation (error case)', async ({ page }) => {
    await page.goto('/atk-requests/create');

    await page.getByRole('combobox', { name: /Barang/i }).click();
    await page.getByRole('option', { name: /Pulpen Hitam/i }).click();

    await page.getByLabel(/Jumlah/i).fill('99999');
    await page.getByRole('button', { name: /Tambah/i }).click();

    await expect(page.locator('body')).toContainText(/Stok tidak cukup/i);
  });
  });

  test('happy path: create → approve L1/L2/L3 → distribute → confirm receive', async ({ browser }) => {
    const contextPegawai = await browser.newContext({
      storageState: 'tests/e2e/.auth/pegawai.json',
    });
    const pagePegawai = await contextPegawai.newPage();

    await pagePegawai.goto('/atk-requests/create');
    await expect(pagePegawai.locator('h1')).toContainText(/Buat Permintaan ATK/i);

    await pagePegawai.getByRole('combobox', { name: /Barang/i }).click();
    await pagePegawai.getByRole('option', { name: /Pulpen Hitam/i }).click();
    await pagePegawai.getByLabel(/Jumlah/i).fill('2');
    await pagePegawai.getByRole('button', { name: /^Tambah$/i }).click();

    await pagePegawai.getByRole('button', { name: /Simpan Permintaan/i }).click();
    await expect(pagePegawai).toHaveURL(/\/atk-requests\/[0-9A-HJKMNP-TV-Z]{26}/i);

    const requestUrl = pagePegawai.url();
    const requestId = requestUrl.split('/').pop() as string;
    const requestNo = (await pagePegawai.locator('h1').textContent())?.trim() ?? '';
    expect(requestId).toBeTruthy();
    expect(requestNo).toMatch(/^REQ-/);
    await expect(pagePegawai.locator('body')).toContainText(/Pending/i);

    await contextPegawai.close();

    const contextOp = await browser.newContext({
      storageState: 'tests/e2e/.auth/operator_persediaan.json',
    });
    const pageOp = await contextOp.newPage();

    await pageOp.goto(`/atk-requests/${requestId}`);
    await pageOp.getByRole('button', { name: /Approve L1/i }).click();
    await expect(pageOp.locator('body')).toContainText(/Approved L1/i);

    await contextOp.close();

    const contextKasubag = await browser.newContext({
      storageState: 'tests/e2e/.auth/kasubag_umum.json',
    });
    const pageKasubag = await contextKasubag.newPage();

    await pageKasubag.goto(`/atk-requests/${requestId}`);
    await pageKasubag.getByRole('button', { name: /Approve L2/i }).click();
    await expect(pageKasubag.locator('body')).toContainText(/Approved L2/i);

    await contextKasubag.close();

    const contextKpa = await browser.newContext({
      storageState: 'tests/e2e/.auth/kpa.json',
    });
    const pageKpa = await contextKpa.newPage();

    await pageKpa.goto(`/atk-requests/${requestId}`);
    await pageKpa.getByRole('button', { name: /Approve L3/i }).click();
    await expect(pageKpa.locator('body')).toContainText(/Approved L3/i);

    const showResp = await pageKpa.request.get(`/atk-requests/${requestId}`, {
      headers: await getXsrfHeaders(pageKpa),
    });
    expect(showResp.ok()).toBeTruthy();

    const showJson = (await showResp.json()) as any;
    const details = showJson?.data?.request_details ?? [];
    expect(details.length).toBeGreaterThan(0);

    const distributeResp = await pageKpa.request.post(
      `/atk-requests/${requestId}/distribute`,
      {
        headers: {
          ...(await getXsrfHeaders(pageKpa)),
          'Content-Type': 'application/json',
        },
        data: {
          items: details.map((d: any) => ({
            detail_id: d.id,
            jumlah_diberikan: d.jumlah_disetujui ?? d.jumlah_diminta ?? 1,
          })),
        },
      },
    );
    expect(distributeResp.ok()).toBeTruthy();

    await pageKpa.reload();
    await expect(pageKpa.locator('body')).toContainText(/Diserahkan/i);

    await contextKpa.close();

    const contextConfirm = await browser.newContext({
      storageState: 'tests/e2e/.auth/pegawai.json',
    });
    const pageConfirm = await contextConfirm.newPage();

    await pageConfirm.goto(`/atk-requests/${requestId}`);
    await pageConfirm.getByRole('button', { name: /Konfirmasi Penerimaan/i }).click();
    await expect(pageConfirm.locator('body')).toContainText(/Diterima/i);

    const itemId = details[0]?.item_id as string | undefined;
    if (itemId) {
      await pageConfirm.goto(`/items/${itemId}/mutations`);
      await expect(pageConfirm.locator('body')).toContainText(/Kartu Stok/i);
      await expect(pageConfirm.locator('body')).toContainText(new RegExp(requestNo));
      await expect(pageConfirm.locator('body')).toContainText(/keluar/i);
    }

    await contextConfirm.close();
  });
});
