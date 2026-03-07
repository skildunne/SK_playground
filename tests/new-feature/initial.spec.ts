import { test, expect } from '@playwright/test';

test('initial setup check', async ({ page }) => {
    await page.goto('http://www.uitestingplayground.com/');
    await expect(page).toHaveTitle(/UI Test Automation/);
});
