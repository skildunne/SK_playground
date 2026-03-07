import { test, expect } from '@playwright/test';

test.describe('Gear Exchange App', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should load the home page correctly', async ({ page }) => {
        await expect(page).toHaveTitle(/Circular Economy Gear Exchange/);
        await expect(page.locator('.logo h1')).toHaveText('Gear Exchange');
    });

    test('should have a default dashboard selected', async ({ page }) => {
        const activeNav = page.locator('.nav-item.active');
        await expect(activeNav).toHaveText(/CEO Orchestrator/);

        const title = page.locator('#current-view-title');
        await expect(title).toHaveText('CEO Orchestrator Master Dashboard');

        // Verify some content loaded in the view container natively instead of an iframe
        const viewContainer = page.locator('#view-container');
        await expect(viewContainer).toBeVisible();
        await expect(viewContainer).toContainText('Agent Master State');
    });

    test('should update view container and title when navigation items are clicked', async ({ page }) => {
        // Click on Acquisition Sniper
        await page.click('button[data-target="acquisition_sniper"]');

        // Verify active class changed
        const activeNav = page.locator('.nav-item.active');
        await expect(activeNav).toHaveText(/Acquisition \(Sniper\)/);

        // Verify title updated
        const title = page.locator('#current-view-title');
        await expect(title).toHaveText('Acquisition Sniper Agent Dashboard');

        // Verify specific content in the view container
        const viewContainer = page.locator('#view-container');
        await expect(viewContainer).toContainText('Profit Margins');

        // Click on Customer Service
        await page.click('button[data-target="ecocoach_cx"]');
        await expect(title).toHaveText('EcoCoach CX Operations Dashboard');
        await expect(viewContainer).toContainText('Chat Feed');
    });

    test('should toggle the emergency kill switch', async ({ page }) => {
        const killSwitch = page.locator('.btn-killswitch');
        const statusText = page.locator('.status-indicator span:nth-child(2)');
        const pulse = page.locator('.pulse');

        // Initial state
        await expect(killSwitch).toContainText('EMERGENCY STOP');
        await expect(statusText).toHaveText('System Active');

        // Click to pause
        await killSwitch.click();

        // Verification of paused state
        await expect(killSwitch).toContainText('RESTORE SYSTEM');
        await expect(statusText).toHaveText('SYSTEM PAUSED');
        await expect(killSwitch).toHaveCSS('background-color', 'rgb(239, 68, 68)');

        // Check pulse styles are updated
        const pulseStyle = await pulse.getAttribute('style');
        expect(pulseStyle).toContain('background-color: var(--danger)');

        // Click to restore
        await killSwitch.click();

        // Verification of restored state
        await expect(killSwitch).toContainText('EMERGENCY STOP');
        await expect(statusText).toHaveText('SYSTEM ACTIVE');
    });
});
