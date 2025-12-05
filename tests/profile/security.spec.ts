import { test, expect } from '@playwright/test';
import users from '../fixtures/users.json';

test.describe('User Profile - Security & Authorization', () => {
    const validUser = users.find(u => u.id === 'user_valid');

    test('Unauthenticated Access to Profile', async ({ page }) => {
        await page.goto('/profile');
        // Expect redirect to login
        await expect(page).toHaveURL(/.*\/login/);
    });

    test('Unauthorized Access (IDOR - View Other Profile)', async ({ page }) => {
        // Login as User A
        await page.goto('/login');
        await page.getByLabel('Email').fill(validUser!.email);
        await page.getByLabel('Password').fill(validUser!.password);
        await page.getByRole('button', { name: 'Login' }).click();

        // Attempt to access User B's profile (Assuming URL structure /profile/:id)
        // We'll use a mocked ID or the ID from the fixture
        await page.goto('/profile/user_2_secret_id');

        // Expect 403 Forbidden or 404 Not Found (or redirect/message)
        // Here we assume the app handles it gracefully by showing "Access Denied" or redirecting
        const accessDenied = page.getByText('Access Denied').or(page.getByText('Page Not Found'));
        await expect(accessDenied).toBeVisible();
    });

    test('Input Sanitization (XSS Prevention)', async ({ page }) => {
        const xssPayload = '<script>alert("XSS")</script>';

        // Login
        await page.goto('/login');
        await page.getByLabel('Email').fill(validUser!.email);
        await page.getByLabel('Password').fill(validUser!.password);
        await page.getByRole('button', { name: 'Login' }).click();

        await page.goto('/profile/edit');

        // Inject XSS
        await page.getByLabel('Bio').fill(xssPayload);

        // Listen for dialog (alert) - if this fires, XSS succeeded (TEST FAIL)
        page.on('dialog', () => {
            throw new Error('XSS Alert executed!');
        });

        await page.getByRole('button', { name: 'Save Changes' }).click();

        // Verify it is displayed as text, not executed
        await page.goto('/profile');
        await expect(page.getByText(xssPayload)).toBeVisible(); // Should be visible as text
    });
});
