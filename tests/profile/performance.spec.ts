import { test, expect } from '@playwright/test';
import users from '../fixtures/users.json';

test.describe('User Profile - Client-Side Performance', () => {
    const validUser = users.find(u => u.id === 'user_valid');

    test.beforeEach(async ({ page }) => {
        // Login first
        await page.goto('/login');
        await page.getByLabel('Email').fill(validUser!.email);
        await page.getByLabel('Password').fill(validUser!.password);
        await page.getByRole('button', { name: 'Login' }).click();
        await expect(page).toHaveURL('/');
    });

    test('Profile Page Load Performance', async ({ page }) => {
        const start = Date.now();
        await page.goto('/profile');

        // Wait for key element to ensure meaningful render
        await page.getByLabel('Bio').waitFor();
        const duration = Date.now() - start;

        console.log(`Profile Page Load Time: ${duration}ms`);

        // Check against threshold (e.g., 2 seconds for UI render)
        expect(duration).toBeLessThan(2000);

        // Optional: navigation timing API check
        const timing = await page.evaluate(() => {
            const entry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
            return entry.domComplete - entry.startTime;
        });
        console.log(`DOM Complete Time: ${timing}ms`);
        expect(timing).toBeLessThan(2000);
    });
});
