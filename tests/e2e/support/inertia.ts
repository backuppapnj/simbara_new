import type { Page } from '@playwright/test';

/**
 * Wait for an Inertia.js page to complete loading and rendering.
 *
 * This helper is designed specifically for Inertia.js applications, which use
 * XHR/fetch requests to update page content without full page reloads.
 *
 * @param page - Playwright Page instance
 * @param options - Optional configuration
 * @param options.url - Expected URL pattern to wait for (optional)
 * @param options.timeout - Maximum time to wait in milliseconds (default: 10000)
 *
 * @example
 * ```typescript
 * // Wait for Inertia page to load
 * await waitForInertiaPage(page);
 *
 * // Wait for specific URL pattern
 * await waitForInertiaPage(page, { url: /\/dashboard/ });
 *
 * // Wait with custom timeout
 * await waitForInertiaPage(page, { timeout: 15000 });
 * ```
 */
export async function waitForInertiaPage(
  page: Page,
  options: { url?: RegExp | string; timeout?: number } = {}
): Promise<void> {
  const { url, timeout = 10000 } = options;

  // Wait for DOM content to be loaded
  await page.waitForLoadState('domcontentloaded', { timeout });

  // If a URL pattern is provided, wait for navigation to complete
  if (url) {
    await page.waitForURL(url, { timeout });
  }

  // Additional wait for Inertia's client-side rendering to complete
  // This ensures React has finished rendering the new page
  await page.waitForTimeout(100);
}

/**
 * Wait for Inertia form submission to complete.
 *
 * This helper waits for form submission, navigation, and success message.
 *
 * @param page - Playwright Page instance
 * @param options - Optional configuration
 * @param options.successMessage - Expected success message text or pattern
 * @param options.targetUrl - Expected URL after successful submission
 * @param options.timeout - Maximum time to wait in milliseconds (default: 10000)
 *
 * @example
 * ```typescript
 * // After submitting a form
 * await page.getByRole('button', { name: /submit/i }).click();
 * await waitForInertiaFormSubmit(page, {
 *   successMessage: /saved successfully/i,
 *   targetUrl: /\/dashboard/
 * });
 * ```
 */
export async function waitForInertiaFormSubmit(
  page: Page,
  options: {
    successMessage?: RegExp | string;
    targetUrl?: RegExp | string;
    timeout?: number;
  } = {}
): Promise<void> {
  const { successMessage, targetUrl, timeout = 10000 } = options;

  // Wait for navigation to complete
  await page.waitForLoadState('domcontentloaded', { timeout });

  // If a target URL is provided, wait for it
  if (targetUrl) {
    await page.waitForURL(targetUrl, { timeout });
  }

  // If a success message is expected, wait for it
  if (successMessage) {
    await page.waitForSelector(`text=${successMessage.source || successMessage}`, {
      state: 'visible',
      timeout,
    });
  }

  // Additional wait for any Inertia deferred props to load
  await page.waitForTimeout(100);
}

/**
 * Wait for Inertia deferred props to load.
 *
 * Inertia v2 supports deferred props that load after the initial page render.
 * This helper waits for those props to finish loading.
 *
 * @param page - Playwright Page instance
 * @param selector - Selector for the element that should appear when props are loaded
 * @param options - Optional configuration
 * @param options.timeout - Maximum time to wait in milliseconds (default: 10000)
 *
 * @example
 * ```typescript
 * // Wait for a deferred prop to load
 * await waitForInertiaDeferredProps(page, '[data-testid="user-stats"]');
 * ```
 */
export async function waitForInertiaDeferredProps(
  page: Page,
  selector: string,
  options: { timeout?: number } = {}
): Promise<void> {
  const { timeout = 10000 } = options;

  // Wait for the selector to appear and be visible
  await page.waitForSelector(selector, {
    state: 'visible',
    timeout,
  });

  // Additional wait for content to be populated
  await page.waitForTimeout(100);
}
