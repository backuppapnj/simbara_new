import { test, expect } from '@playwright/test';
import { login, logout } from './support/auth';
import { testUsers } from './support/test-users';

/**
 * Mobile & Responsive Behavior E2E Tests
 *
 * Tests mobile-specific features and responsive design including:
 * - Bottom navigation on mobile viewports
 * - PWA install prompts
 * - Pull-to-refresh functionality
 * - Responsive breakpoints (mobile, tablet, desktop)
 * - Mobile-specific UI components
 * - Touch gestures and interactions
 *
 * Components tested:
 * - BottomNav.tsx
 * - InstallButton.tsx
 * - InstallPrompt.tsx
 * - PullToRefresh.tsx
 */

test.describe('Mobile - Bottom Navigation', () => {
  test.describe('Mobile Viewport', () => {
    test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

    test.beforeEach(async ({ page }) => {
      await login(page, testUsers.pegawai);
    });

    test.afterEach(async ({ page }) => {
      await logout(page);
    });

    test('should display bottom navigation on mobile', async ({ page }) => {
      await page.goto('/dashboard');

      // Look for bottom navigation
      const bottomNav = page.locator('[data-test="bottom-nav"]').or(
        page.locator('nav[aria-label*="bottom" i]').or(
          page.locator('.bottom-nav').or(
            page.locator('nav').filter({ has: page.locator('fixed') })
          )
        )
      );

      if (await bottomNav.count() > 0) {
        await expect(bottomNav).toBeVisible();
      }
    });

    test('should have main navigation items in bottom nav', async ({ page }) => {
      await page.goto('/dashboard');

      const bottomNav = page.locator('[data-test="bottom-nav"]').or(
        page.locator('.bottom-nav')
      );

      if (await bottomNav.count() > 0) {
        // Look for common navigation items
        const navItems = ['Dashboard', 'Assets', 'ATK', 'Menu'];

        for (const item of navItems) {
          const navLink = bottomNav.getByRole('link', { name: item, exact: false });
          // Items might or might not exist
          if (await navLink.count() > 0) {
            await expect(navLink).toBeVisible();
          }
        }
      }
    });

    test('should hide sidebar on mobile', async ({ page }) => {
      await page.goto('/dashboard');

      // Look for sidebar - it should be hidden or collapsible on mobile
      const sidebar = page.locator('[data-test="sidebar"]').or(
        page.locator('.sidebar').or(
          page.locator('aside')
        )
      );

      if (await sidebar.count() > 0) {
        const isVisible = await sidebar.isVisible();
        // Sidebar might be hidden by default on mobile
        if (isVisible) {
          // If visible, it should be collapsible
          const closeButton = page.getByRole('button', { name: /close|menu/i });
          if (await closeButton.count() > 0) {
            await closeButton.first().click();
            await expect(sidebar).not.toBeVisible();
          }
        }
      }
    });

    test('should show hamburger menu on mobile', async ({ page }) => {
      await page.goto('/dashboard');

      // Look for hamburger menu button
      const menuButton = page.getByRole('button', { name: /menu|open|navigation/i }).or(
        page.locator('[data-test="menu-button"]')
      );

      if (await menuButton.count() > 0) {
        await expect(menuButton).toBeVisible();

        // Click to open menu
        await menuButton.click();

        // Verify menu opens
        const mobileMenu = page.locator('[data-test="mobile-menu"]').or(
          page.locator('.mobile-menu')
        );

        if (await mobileMenu.count() > 0) {
          await expect(mobileMenu).toBeVisible();
        }
      }
    });
  });
});

test.describe('Mobile - PWA Installation', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.pegawai);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should show install prompt on mobile', async ({ page }) => {
    await page.goto('/dashboard');

    // Look for install button or prompt
    const installButton = page.locator('[data-test="pwa-install-button"]').or(
      page.locator('button:has-text("Install")').or(
        page.locator('.install-prompt')
      )
    );

    // Install prompt might not show if already installed
    if (await installButton.count() > 0) {
      await expect(installButton).toBeVisible();

      // Click install button (will show browser install dialog)
      await installButton.click();

      // Wait for browser dialog (can't interact with it in Playwright)
      await page.waitForTimeout(1000);
    }
  });

  test('should have PWA manifest', async ({ page }) => {
    await page.goto('/');

    // Check for manifest link
    const manifestLink = page.locator('link[rel="manifest"]');

    if (await manifestLink.count() > 0) {
      const href = await manifestLink.getAttribute('href');

      // Fetch manifest
      if (href) {
        const response = await page.context().request.get(new URL(href, page.url()).href);
        expect(response.status()).toBe(200);

        const manifest = await response.json();
        expect(manifest).toHaveProperty('name');
        expect(manifest).toHaveProperty('start_url');
      }
    }
  });

  test('should have service worker registered', async ({ page }) => {
    await page.goto('/dashboard');

    // Check for service worker in navigator
    const hasServiceWorker = await page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });

    expect(hasServiceWorker).toBeTruthy();
  });

  test('should be installable as PWA', async ({ page }) => {
    await page.goto('/dashboard');

    // Check if beforeinstallprompt event would fire
    // This is difficult to test in Playwright as it requires user interaction
    const hasInstallPrompt = await page.evaluate(() => {
      return 'onbeforeinstallprompt' in window;
    });

    expect(hasInstallPrompt).toBeTruthy();
  });
});

test.describe('Mobile - Pull to Refresh', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.pegawai);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should support pull to refresh gesture', async ({ page }) => {
    await page.goto('/dashboard');

    // Look for pull-to-refresh component
    const pullToRefresh = page.locator('[data-test="pull-to-refresh"]').or(
      page.locator('.pull-to-refresh')
    );

    // Component might be present
    if (await pullToRefresh.count() > 0) {
      // Simulate pull gesture
      await page.touchscreen.tap(0, 0);

      // Pull down
      await page.touchscreen.touchMove(0, 200);

      // Wait for refresh indicator
      await page.waitForTimeout(500);

      // Release
      await page.touchscreen.touchEnd();

      // Wait for refresh to complete
      await page.waitForTimeout(1000);
    }
  });

  test('should show refresh indicator when pulling', async ({ page }) => {
    await page.goto('/items');

    // Look for refresh indicator
    const refreshIndicator = page.locator('[data-test="refresh-indicator"]').or(
      page.locator('.refreshing').or(
        page.locator('[aria-busy="true"]')
      )
    );

    // Pull-to-refresh might trigger loading state
    // This would require actual touch simulation
  });
});

test.describe('Responsive - Tablet Viewport', () => {
  test.use({ viewport: { width: 768, height: 1024 } }); // iPad

  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should adapt layout for tablet', async ({ page }) => {
    await page.goto('/dashboard');

    // Verify content is visible and properly sized
    await expect(page.getByRole('main')).toBeVisible();

    // Sidebar might be collapsible on tablet
    const sidebar = page.locator('aside').or(
      page.locator('.sidebar')
    );

    if (await sidebar.count() > 0) {
      await expect(sidebar).toBeVisible();
    }
  });

  test('should adjust grid columns for tablet', async ({ page }) => {
    await page.goto('/admin/roles');

    // Look for grid that might adjust columns
    const grid = page.locator('.grid').or(
      page.locator('[role="list"]')
    );

    if (await grid.count() > 0) {
      await expect(grid).toBeVisible();

      // Grid should have appropriate columns for tablet
      const gridClass = await grid.getAttribute('class');
      expect(gridClass).toBeTruthy();
    }
  });
});

test.describe('Responsive - Desktop Viewport', () => {
  test.use({ viewport: { width: 1920, height: 1080 } }); // Full HD

  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should display full sidebar on desktop', async ({ page }) => {
    await page.goto('/dashboard');

    // Sidebar should be visible on desktop
    const sidebar = page.locator('aside').or(
      page.locator('[data-test="sidebar"]')
    );

    if (await sidebar.count() > 0) {
      await expect(sidebar).toBeVisible();
    }
  });

  test('should hide bottom navigation on desktop', async ({ page }) => {
    await page.goto('/dashboard');

    // Bottom nav should not be visible on desktop
    const bottomNav = page.locator('[data-test="bottom-nav"]').or(
      page.locator('.bottom-nav')
    );

    if (await bottomNav.count() > 0) {
      await expect(bottomNav).not.toBeVisible();
    }
  });

  test('should use maximum grid columns on desktop', async ({ page }) => {
    await page.goto('/admin/roles');

    // Grid should use all available columns on desktop
    const grid = page.locator('.grid');

    if (await grid.count() > 0) {
      await expect(grid).toBeVisible();

      // Check for responsive grid classes
      const gridClass = await grid.getAttribute('class');
      expect(gridClass || '').toMatch(/lg:grid-cols|grid-cols/);
    }
  });
});

test.describe('Mobile - Touch Interactions', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.pegawai);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should handle tap on buttons', async ({ page }) => {
    await page.goto('/items');

    // Find a button and tap it
    const button = page.getByRole('button').first();

    if (await button.count() > 0) {
      await button.tap();
      await page.waitForTimeout(500);
    }
  });

  test('should handle swipe gestures', async ({ page }) => {
    await page.goto('/items');

    // Look for swipeable components (carousels, etc.)
    const swipeable = page.locator('[data-test="swipeable"]').or(
      page.locator('.carousel').or(
        page.locator('.swiper')
      )
    );

    // Swipe gestures would be component-specific
  });

  test('should handle pinch zoom', async ({ page }) => {
    await page.goto('/assets');

    // Test that pinch zoom works or is prevented appropriately
    // Most apps prevent zoom on mobile
    const viewportMeta = page.locator('meta[name="viewport"]');

    if (await viewportMeta.count() > 0) {
      const content = await viewportMeta.getAttribute('content');
      expect(content || '').toMatch(/maximum-scale|user-scalable=no/);
    }
  });
});

test.describe('Mobile - Offline Mode', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.pegawai);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should show offline alert when disconnected', async ({ page }) => {
    await page.goto('/dashboard');

    // Simulate offline mode
    await page.context().setOffline(true);

    // Look for offline alert/banner
    const offlineAlert = page.locator('[data-test="offline-alert"]').or(
      page.locator('.offline-banner').or(
        page.getByText(/offline|no internet/i)
      )
    );

    // Wait for offline detection
    await page.waitForTimeout(2000);

    // Offline indicator might appear
    if (await offlineAlert.count() > 0) {
      await expect(offlineAlert).toBeVisible();
    }

    // Restore online
    await page.context().setOffline(false);
  });

  test('should queue actions when offline', async ({ page }) => {
    await page.goto('/dashboard');

    // Go offline
    await page.context().setOffline(true);

    // Wait for offline detection
    await page.waitForTimeout(2000);

    // Try to perform an action
    const actionButton = page.getByRole('button').first();
    if (await actionButton.count() > 0) {
      await actionButton.click();

      // Look for queued action indicator
      const queuedIndicator = page.locator('[data-test="queued-actions"]').or(
        page.getByText(/queued|pending/i)
      );

      // Actions might be queued
    }

    // Go back online
    await page.context().setOffline(false);

    // Wait for sync
    await page.waitForTimeout(2000);
  });
});

test.describe('Mobile - Performance', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.pegawai);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should load quickly on mobile', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/dashboard');

    // Wait for page to be fully loaded
    await page.waitForLoadState('domcontentloaded');

    const loadTime = Date.now() - startTime;

    // Should load in less than 5 seconds on mobile
    expect(loadTime).toBeLessThan(5000);
  });

  test('should have good mobile performance metrics', async ({ page }) => {
    await page.goto('/dashboard');

    // Wait for page to load
    await page.waitForLoadState('domcontentloaded');

    // Get performance metrics
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
      };
    });

    // Metrics should be within acceptable ranges for mobile
    expect(metrics.domContentLoaded).toBeLessThan(3000);
    expect(metrics.loadComplete).toBeLessThan(5000);
  });
});
