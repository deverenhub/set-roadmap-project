// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should show login page when not authenticated', async ({ page }) => {
    await page.goto('/');
    
    // Should see login form
    await expect(page.locator('text=Sign in')).toBeVisible();
  });

  test('should display validation errors on empty submit', async ({ page }) => {
    await page.goto('/');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Form should show required field validation
    await expect(page.locator('input:invalid')).toHaveCount(2);
  });

  test('should handle login error', async ({ page }) => {
    await page.goto('/');
    
    // Fill in invalid credentials
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 5000 });
  });
});
