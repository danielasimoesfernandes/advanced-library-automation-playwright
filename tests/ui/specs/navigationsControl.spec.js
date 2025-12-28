////////////////////////////////////////
///////// 2. NAVIGATION CONTROL ////////
////////////////////////////////////////

// @ts-check
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/dashboardPage';

test.describe('Navigation Control', () => {
    test('CT-FE-005 - Access control for unauthenticated users', async ({ page }) => {

        const loginPage = new LoginPage(page);

        // Clear localStorage
        await page.goto('http://localhost:3000/login.html'); // ou qualquer página da sua app
        await page.evaluate(() => localStorage.clear());

        // Try to navigate directly to dashboard page 
        await page.goto('http://localhost:3000/dashboard.html');

        // Redirect to login page 
        await page.waitForURL(/login\.html$/, { timeout: 30000 });
        await loginPage.verifyLoginPage();

        // Clear locaStorage to avoid interference with other tests
        await page.evaluate(() => {
            localStorage.clear();
        });
    });

    test('CT-FE-006 - Dynamic Menu – Student', async ({ page }) => {

        const loginPage = new LoginPage(page);
        const dashboardPage = new DashboardPage(page);

        //Open login page
        await loginPage.goToWebsite();

        // Accept dialog 
        await Promise.all([
            page.waitForEvent('dialog').then(async dialog => {
                console.log('Dialog:', dialog.message());
                expect(dialog.message()).toBe('Login realizado com sucesso!');
                await dialog.accept();
            }),
            // Log in with student user 
            await loginPage.logInStudentUser()
        ]);

        // Verify the user is logged in 
        await dashboardPage.verifyDashboardTitle();

        // Get logged user from localStorage
        expect(await dashboardPage.usernameDisplayed()).toBeTruthy();
        // @ts-ignore
        const loggedUser = await page.evaluate(() => JSON.parse(localStorage.getItem('usuario')));
        expect(await dashboardPage.getUsername()).toContain(loggedUser.nome);

        // Username visible in header
        expect(await dashboardPage.usernameDisplayed());
        expect(await dashboardPage.getUsername()).toContain(loggedUser.nome);

        // Menu displayed and their expected URLs
        const menuItems = [
            { button: dashboardPage.dashboardMenuButton, url: /dashboard\.html$/ },
            { button: dashboardPage.booksMenuButton, url: /livros\.html$/ },
            { button: dashboardPage.favoritesMenuButton, url: /favoritos\.html$/ },
            { button: dashboardPage.myRentalsMenuButton, url: /arrendamentos\.html$/ },
            { button: dashboardPage.purchasesMenuButton, url: /compras\.html$/ },
            { button: dashboardPage.myPurchasesMenuButton, url: /minhas-compras\.html$/ },
        ];

        for (const item of menuItems) {
            await expect(item.button).toBeVisible();
            await item.button.click();
            await expect(page).toHaveURL(item.url);
        };

        // Clear locaStorage to avoid interference with other tests
        await page.evaluate(() => {
            localStorage.clear();
        });
    });

    test('CT-FE-007 - Dynamic Menu – Admin', async ({ page }) => {

        const loginPage = new LoginPage(page);
        const dashboardPage = new DashboardPage(page);

        // Open login page 
        await loginPage.goToWebsite();

        // Accept dialog 
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

        // Get logged user from localStorage
        expect(await dashboardPage.usernameDisplayed()).toBeTruthy();
        // @ts-ignore
        const loggedUser = await page.evaluate(() => JSON.parse(localStorage.getItem('usuario')));
        expect(await dashboardPage.getUsername()).toContain(loggedUser.nome);

        // Username visible in header
        expect(await dashboardPage.usernameDisplayed());
        expect(await dashboardPage.getUsername()).toContain(loggedUser.nome);

        // Menu displayed and their expected URLs
        const menuItems = [
            { button: dashboardPage.dashboardMenuButton, url: /dashboard\.html$/ },
            { button: dashboardPage.booksMenuButton, url: /livros\.html$/ },
            { button: dashboardPage.favoritesMenuButton, url: /favoritos\.html$/ },
            { button: dashboardPage.myRentalsMenuButton, url: /arrendamentos\.html$/ },
            { button: dashboardPage.approvalsMenuButton, url: /aprovacoes\.html$/ },
            { button: dashboardPage.adminPurchasesMenuButton, url: /compras-admin\.html$/ },
            { button: dashboardPage.usersMenuButton, url: /admin-usuarios\.html$/ },
        ];

        for (const item of menuItems) {
            await expect(item.button).toBeVisible();
            await item.button.click();
            await expect(page).toHaveURL(item.url);
        };

        // Clear locaStorage to avoid interference with other tests
        await page.evaluate(() => {
            localStorage.clear();
        });
    });
});