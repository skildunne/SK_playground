import { test, expect } from '@playwright/test';
import users from '../fixtures/users.json';

test.describe('User Profile - CRUD Operations', () => {
    const validUser = users.find(u => u.id === 'user_valid');
    const updateUser = users.find(u => u.id === 'user_update');

    test.beforeEach(async ({ page }) => {
        // Assuming a reset or clean state might be needed, or we just rely on unique data if possible.
        // For this example, we'll start at the home page.
        await page.goto('/');
    });

    test('Create Profile (Registration)', async ({ page }) => {
        // Navigate to Registration
        await page.getByRole('link', { name: 'Sign Up' }).click();

        // Fill Form
        await page.getByLabel('Email').fill(`new.user.${Date.now()}@example.com`);
        await page.getByLabel('Password').fill('Password123!');
        await page.getByLabel('Name').fill('New User');
        await page.getByRole('button', { name: 'Register' }).click();

        // Verify Redirect to Profile or Welcome
        await expect(page).toHaveURL(/.*\/profile/);
        await expect(page.getByText('New User')).toBeVisible();
    });

    test('Read Profile (View Details)', async ({ page }) => {
        // Login
        await page.goto('/login');
        await page.getByLabel('Email').fill(validUser!.email);
        await page.getByLabel('Password').fill(validUser!.password);
        await page.getByRole('button', { name: 'Login' }).click();

        // Navigate to Profile
        await page.getByRole('link', { name: 'Profile' }).click();

        // Verify Details
        await expect(page.getByLabel('Name')).toHaveValue(validUser!.name);
        await expect(page.getByLabel('Email')).toHaveValue(validUser!.email);
        await expect(page.getByLabel('Bio')).toHaveValue(validUser!.bio!); // Non-null assertion for optional field
    });

    test('Update Profile', async ({ page }) => {
        // Login as Update User
        await page.goto('/login');
        await page.getByLabel('Email').fill(updateUser!.email);
        await page.getByLabel('Password').fill(updateUser!.password);
        await page.getByRole('button', { name: 'Login' }).click();

        await page.getByRole('link', { name: 'Profile' }).click();

        // Update Fields
        const newBio = 'Updated Bio Content';
        await page.getByLabel('Bio').fill(newBio);
        await page.getByRole('button', { name: 'Save Changes' }).click();

        // Verify Persistence (Reload)
        await page.reload();
        await expect(page.getByLabel('Bio')).toHaveValue(newBio);
    });

    test('Delete Profile', async ({ page }) => {
        // Create a temporary user to delete so we don't break fixtures for other tests
        const tempUserEmail = `delete.temp.${Date.now()}@example.com`;

        // Register
        await page.goto('/signup');
        await page.getByLabel('Email').fill(tempUserEmail);
        await page.getByLabel('Password').fill('Password123!');
        await page.getByRole('button', { name: 'Register' }).click();
        await expect(page).toHaveURL(/.*\/profile/);

        // Delete
        await page.on('dialog', dialog => dialog.accept()); // Handle confirmation alert
        await page.getByRole('button', { name: 'Delete Account' }).click();

        // Verify Redirect to Home or Login
        await expect(page).toHaveURL(/.*\/login/);

        // Verify Login Fails
        await page.getByLabel('Email').fill(tempUserEmail);
        await page.getByLabel('Password').fill('Password123!');
        await page.getByRole('button', { name: 'Login' }).click();
        await expect(page.getByText('Invalid credentials')).toBeVisible();
    });
});
