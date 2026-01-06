// tests/e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.goto('/');
  });

  test('should display KPI cards', async ({ page }) => {
    // Wait for page to load
    await page.waitForSelector('[data-testid="kpi-card"]', { timeout: 10000 });
    
    // Check that KPI cards are visible
    const kpiCards = page.locator('[data-testid="kpi-card"]');
    await expect(kpiCards).toHaveCount(4);
  });

  test('should navigate to capabilities', async ({ page }) => {
    await page.click('text=Capabilities');
    await expect(page).toHaveURL(/.*capabilities/);
  });

  test('should open AI chat panel', async ({ page }) => {
    await page.click('[data-testid="chat-toggle"]');
    await expect(page.locator('[data-testid="chat-panel"]')).toBeVisible();
  });
});
