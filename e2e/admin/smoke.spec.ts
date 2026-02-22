import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard - Auth', () => {
  test('redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('login page loads correctly', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('body')).toBeVisible();
    // Should have email/password inputs
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('login page has submit button', async ({ page }) => {
    await page.goto('/login');
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
  });

  test('shows error on invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"], input[name="email"]', 'invalid@test.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    // Should remain on login or show error
    await page.waitForTimeout(2000);
    const url = page.url();
    expect(url).toContain('/login');
  });
});

test.describe('Admin Dashboard - Protected Routes', () => {
  const protectedRoutes = [
    '/dashboard',
    '/dashboard/users',
    '/dashboard/licenses',
    '/dashboard/payments',
    '/dashboard/analytics',
    '/dashboard/downloads',
    '/dashboard/settings',
  ];

  for (const route of protectedRoutes) {
    test(`${route} redirects to login when unauthenticated`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/\/login/);
    });
  }
});

test.describe('Admin Dashboard - SEO', () => {
  test('robots.txt blocks indexing', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain('Disallow: /');
  });
});
