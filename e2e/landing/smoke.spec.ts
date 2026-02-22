import { test, expect } from '@playwright/test';

test.describe('Landing Site - Core Pages', () => {
  test('homepage loads with correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Velanova/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('homepage has navigation', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
  });

  test('homepage has hero section', async ({ page }) => {
    await page.goto('/');
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
  });

  test('pricing page loads', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page).toHaveTitle(/Pricing|Velanova/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('download page loads', async ({ page }) => {
    await page.goto('/download');
    await expect(page).toHaveTitle(/Download|Velanova/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('docs page loads', async ({ page }) => {
    await page.goto('/docs');
    await expect(page).toHaveTitle(/Docs|Documentation|Velanova/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('contact page loads', async ({ page }) => {
    await page.goto('/contact');
    await expect(page).toHaveTitle(/Contact|Velanova/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('login page loads', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Landing Site - Legal Pages', () => {
  test('terms page loads', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.locator('body')).toBeVisible();
  });

  test('privacy page loads', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.locator('body')).toBeVisible();
  });

  test('refund page loads', async ({ page }) => {
    await page.goto('/refund');
    await expect(page.locator('body')).toBeVisible();
  });

  test('cookies page loads', async ({ page }) => {
    await page.goto('/cookies');
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Landing Site - SEO Essentials', () => {
  test('has meta description', async ({ page }) => {
    await page.goto('/');
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute('content', /.+/);
  });

  test('has Open Graph tags', async ({ page }) => {
    await page.goto('/');
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /.+/);
    const ogDescription = page.locator('meta[property="og:description"]');
    await expect(ogDescription).toHaveAttribute('content', /.+/);
  });

  test('has favicon', async ({ page }) => {
    await page.goto('/');
    const favicon = page.locator('link[rel="icon"]');
    await expect(favicon).toHaveAttribute('href', /.+/);
  });

  test('sitemap.xml is accessible', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain('<urlset');
  });

  test('robots.txt is accessible', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain('Sitemap');
  });
});

test.describe('Landing Site - Navigation', () => {
  test('footer has all legal links', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer.locator('a[href="/terms"]')).toBeVisible();
    await expect(footer.locator('a[href="/privacy"]')).toBeVisible();
  });

  test('404 page shows for invalid routes', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');
    expect(response?.status()).toBe(404);
  });
});
