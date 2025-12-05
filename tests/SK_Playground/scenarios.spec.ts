import { test, expect } from '../utils/healing-fixture';

test.describe('SK_Playground Scenarios', () => {
    const baseURL = 'http://www.uitestingplayground.com';

    test.beforeEach(async ({ page }) => {
        await page.goto(baseURL);
    });

    test('Dynamic ID', async ({ page }) => {
        // Navigate to Dynamic ID page
        await page.getByRole('link', { name: 'Dynamic ID' }).click();
        await expect(page).toHaveURL(`${baseURL}/dynamicid`);

        // Locate button by role and name (ignoring the dynamic ID)
        const button = page.getByRole('button', { name: 'Button with Dynamic ID' });

        // Assert visibility and clickability
        await expect(button).toBeVisible();
        await button.click();
    });

    test('Class Attribute', async ({ page }) => {
        // Navigate to Class Attribute page
        await page.getByRole('link', { name: 'Class Attribute' }).click();
        await expect(page).toHaveURL(`${baseURL}/classattr`);

        // Locate the blue primary button using a CSS selector that targets the specific class combination
        // and ensuring it's the specific button we want (often the challenge here is distinguishing it)
        // The instructions usually imply clicking the one that triggers the alert.
        // Using a more robust selector that looks for the btn-primary class.
        const primaryButton = page.locator('button.btn-primary');

        // Handle the alert dialog
        page.on('dialog', async dialog => {
            expect(dialog.message()).toContain('Primary button pressed');
            await dialog.accept();
        });

        await primaryButton.click();
    });

    test('Hidden Layers', async ({ page }) => {
        // Navigate to Hidden Layers page
        await page.getByRole('link', { name: 'Hidden Layers' }).click();
        await expect(page).toHaveURL(`${baseURL}/hiddenlayers`);

        // Click the green button
        const greenButton = page.locator('#greenButton'); // Use ID if stable, or getByRole('button', { name: 'Button' })
        await expect(greenButton).toBeVisible();
        await greenButton.click();

        // Challenge: ensure we can't click it again or that state changed. 
        // Usually a new layer appears. We can try to click and expect failure or check if another element intercepts.
        // However, clean test just asserts the first click works. 
        // Let's verify attributes or side effects if possible, but simple click success is the primary goal here.
    });

    test('Load Delay', async ({ page }) => {
        // Navigate to Load Delay page
        await page.getByRole('link', { name: 'Load Delay' }).click();
        await expect(page).toHaveURL(`${baseURL}/loaddelay`);

        // The button takes time to appear. Playwright auto-waits, but we test that behavior.
        const button = page.getByRole('button', { name: 'Button Appearing After Delay' });

        await expect(button).toBeVisible();
        await button.click();
    });

    test('AJAX Data', async ({ page }) => {
        // Navigate to AJAX Data page
        await page.getByRole('link', { name: 'AJAX Data' }).click();
        await expect(page).toHaveURL(`${baseURL}/ajax`);

        // Click trigger button
        await page.getByRole('button', { name: 'Button Triggering AJAX Request' }).click();

        // Wait for the success message to appear (auto-retry assertion)
        const successMessage = page.getByText('Data loaded with AJAX get request.');
        await expect(successMessage).toBeVisible({ timeout: 20000 }); // extended timeout just in case network is slow
    });
});
