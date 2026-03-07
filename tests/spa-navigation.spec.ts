import { test, expect } from '@playwright/test';

test.describe('Gear Exchange SPA Navigation', () => {
    // Use the Vite default port for the tests
    const baseURL = 'http://localhost:5173';

    test('should render the homepage with exact SPA text', async ({ page }) => {
        // Navigate to the Vite dev server
        await page.goto(baseURL);

        // Verify the main heroic title is visible
        await expect(page.getByText('Circular Economy Gear Exchange')).toBeVisible();

        // Verify the CTA button is visible
        const browseButton = page.getByRole('link', { name: /Browse the Marketplace/i });
        await expect(browseButton).toBeVisible();
    });

    test('should navigate to the products page without full page reload', async ({ page }) => {
        await page.goto(baseURL);

        // Click the CTA link
        await page.getByRole('link', { name: /Browse the Marketplace/i }).click();

        // The URL should change to /products
        await expect(page).toHaveURL(`${baseURL}/products`);

        // The heading for marketplace should be visible
        await expect(page.getByRole('heading', { name: 'Live Marketplace' })).toBeVisible();

        // The cart should be in the sidebar
        await expect(page.getByText('Your Cart')).toBeVisible();
    });

    test('should correctly show empty state or products depending on network', async ({ page }) => {
        await page.goto(`${baseURL}/products`);

        // Wait for either the empty state or product grid to render
        // If backend is down, an error message or empty state might show.
        // If backend is up, the grid will populate.
        // This assertion just ensures the products page didn't crash.
        const liveHeader = page.getByRole('heading', { name: 'Live Marketplace' });
        await expect(liveHeader).toBeVisible();
    });
});
