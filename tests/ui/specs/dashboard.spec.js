///////////////////////////////////////
///////////// 3. DASHBOARD ////////////
///////////////////////////////////////

// @ts-check
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/dashboardPage';
import { BookFactory } from '../../api/factories/bookFactory';

test.describe('Dashboard Tests', () => {
    test('CT-FE-008 - Dashboard – Admin vision', async ({ page, request }) => {

        const loginPage = new LoginPage(page);
        const dashboardPage = new DashboardPage(page);
        const bookFactory = new BookFactory(request);

        // Use API to create more books
        for (let i = 0; i < 4; i++) {
            const response = await bookFactory.createBookTest();
            expect(response.status()).toBe(201); // Ensure book was created
            const book = await response.json();
            console.log(`Created book: ${book.nome} by ${book.autor}`); // Log book info
        };

        //Open login page
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

        //Access dashboard
        await dashboardPage.verifyDashboardTitle();

        //Check stats 
        await dashboardPage.verifyAllStatsCardsVisibleForAdmin();

        //Validate books available
        const availableBooks = await dashboardPage.getStatValue(
            dashboardPage.availableBooksCard);
        expect(availableBooks).toBeGreaterThan(0);

        //Validate books grid (max = 5)
        const count = await dashboardPage.availableBooksGrid.count();
        expect(count).toBeLessThanOrEqual(5);

        // Clear locaStorage to avoid interference with other tests
        await page.evaluate(() => {
            localStorage.clear();
        });
    });

    test('CT-FE-009 - Dashboard – Student vision', async ({ page, request }) => {

        const loginPage = new LoginPage(page);
        const dashboardPage = new DashboardPage(page);
        //API request
        const bookFactory = new BookFactory(request);

        // Use API to create more books
        for (let i = 0; i < 4; i++) {
            const response = await bookFactory.createBookTest();
            expect(response.status()).toBe(201); // Ensure book was created
            const book = await response.json();
            console.log(`Created book: ${book.nome} by ${book.autor}`); // Log book info
        };

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

        //Access dashboard
        await dashboardPage.verifyDashboardTitle();

        //Check stats 
        await dashboardPage.verifyAllStatsCardsVisibleForStudent();

        //Validate books available
        const availableBooks = await dashboardPage.getStatValue(
            dashboardPage.availableBooksCard);
        expect(availableBooks).toBeGreaterThan(0);

        //Validate books grid (max = 5)
        const count = await dashboardPage.availableBooksGrid.count();
        expect(count).toBeLessThanOrEqual(5);

        // Clear locaStorage to avoid interference with other tests
        await page.evaluate(() => {
            localStorage.clear();
        });
    });
}); 