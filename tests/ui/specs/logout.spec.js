////////////////////////////////////////
////////////// 9. LOGOUT ///////////////
////////////////////////////////////////

// @ts-check
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { RegistrationPage } from '../pages/RegistrationPage';
import { DashboardPage } from '../pages/dashboardPage';

test.describe('Logout Tests', () => {
    test('CT-FE-024 - Logout from the application', async ({ page }) => {

        const loginPage = new LoginPage(page);
        const registrationPage = new RegistrationPage(page);
        const dashboardPage = new DashboardPage(page);

        //Open login page
        await loginPage.goToWebsite();

        // Login with admin user
        /// Accept dialog 
        await Promise.all([
            page.waitForEvent('dialog').then(async dialog => {
                console.log('Dialog:', dialog.message());
                expect(dialog.message()).toBe('Login realizado com sucesso!');
                await dialog.accept();
            }),
            // Log in with admin user 
            await loginPage.logInAdminUser()
        ]);

        // Verify the user is logged in 
        await dashboardPage.verifyDashboardTitle();

        // Logout
        await dashboardPage.logoutButton.click();
        console.log('User logged out successfully.');

        // Verify redirected to login page
        await expect(loginPage.loginPageTitle).toBeVisible();
        await expect(page).toHaveURL(/login\.html$/);

        // Verify localStorage is cleared
        const savedUser = await page.evaluate(() => localStorage.getItem('usuario'));
        expect(savedUser).toBeNull();
        console.log('LocalStorage cleared after logout.');

        // Try to access dashboard page after logout
        await page.goto('http://localhost:3000/dashboard.html');
        await expect(loginPage.loginPageTitle).toBeVisible();
        await expect(page).toHaveURL(/login\.html$/);
        console.log('Access to dashboard blocked after logout as expected.');

        // Clear locaStorage to avoid interference with other tests
        await page.evaluate(() => {
            localStorage.clear();
        });
    });
});