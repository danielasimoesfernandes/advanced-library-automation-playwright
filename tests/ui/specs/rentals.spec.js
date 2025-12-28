////////////////////////////////////////
////////////// 6. RENTALS //////////////
////////////////////////////////////////

import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/dashboardPage';
import { RentalsPage } from '../pages/rentalsPage';
import { BookFactory } from '../../api/factories/bookFactory';
import { UserFactory } from '../../api/factories/userFactory';
import { ApprovalsPage } from '../pages/approvalsPage';

test.describe('Rentals tests', () => {
    test('CT-FE-016 - Request new book rental', async ({ page, request }) => {

        const loginPage = new LoginPage(page);
        const dashboardPage = new DashboardPage(page);
        const rentalsPage = new RentalsPage(page);
        //API request
        const bookFactory = new BookFactory(request);
        const userFactory = new UserFactory(request);

        // Create user via API
        const { response, fullName, email, password } = await userFactory.registerTestUser();
        expect(response.status()).toBe(201); // Ensure user was created
        console.log(`Created user: ${fullName} with email: ${email}`); // Log user info

        // Use API to create more book
        const bookResponse = await bookFactory.createBookTest();
        expect(bookResponse.status()).toBe(201); // Ensure book was created
        const book = await bookResponse.json();
        console.log(`Created book: ${book.nome} by ${book.autor}`); // Log book info
        const fullBookTitle = `${book.nome} (${book.autor})`;
        const bookId = book.id;

        //Open login page
        await loginPage.goToWebsite();

        // Accept dialog and log in with student user
        await Promise.all([
            page.waitForEvent('dialog').then(async dialog => {
                console.log('Dialog:', dialog.message());
                expect(dialog.message()).toBe('Login realizado com sucesso!');
                await dialog.accept();
            }),
            await loginPage.logIn({ email, password })
        ]);

        //Access rentals menu 
        await dashboardPage.clickOnMenu(dashboardPage.myRentalsMenuButton);
        await rentalsPage.verifyRentalsTitle();

        // Request new rental
        const today = new Date();
        const startDate = today.toISOString().split('T')[0]; // DD/MM/YYYY
        const endDateObj = new Date();
        endDateObj.setDate(today.getDate() + 7); // 7 days later
        const endDate = endDateObj.toISOString().split('T')[0]; // DD/MM/YYYY

        // Accept dialog and request rental
        await Promise.all([
            page.waitForEvent('dialog').then(async dialog => {
                console.log('Dialog:', dialog.message());
                expect(dialog.message()).toBe('Arrendamento solicitado com sucesso!');
                await dialog.accept();
            }),
            await rentalsPage.requestNewRental(fullBookTitle, startDate, endDate)
        ]);

        // Verify that the book appears in the rentals list using id    
        await rentalsPage.verifyRentedBookInList(bookId, 'PENDENTE');

        // Clear local storage
        await page.evaluate(() => {
            localStorage.clear();
        });
    });

    test('CT-FE-017 - Rental approval', async ({ page, request }) => {

        const loginPage = new LoginPage(page);
        const dashboardPage = new DashboardPage(page);
        const rentalsPage = new RentalsPage(page);
        const approvalsPage = new ApprovalsPage(page);
        //API request
        const bookFactory = new BookFactory(request);
        const userFactory = new UserFactory(request);

        // Create user via API
        const { response, userId, fullName, email, password } = await userFactory.registerTestUser();
        expect(response.status()).toBe(201); // Ensure user was created
        console.log(`Created user: ${fullName} with email: ${email}`); // Log user info

        // Use API to create more book
        const bookResponse = await bookFactory.createBookTest();
        expect(bookResponse.status()).toBe(201); // Ensure book was created
        const book = await bookResponse.json();
        console.log(`Created book: ${book.nome} by ${book.autor}`); // Log book info
        const fullBookTitle = `${book.nome} (${book.autor})`;
        const bookId = book.id;

        //Open login page
        await loginPage.goToWebsite();

        // Accept dialog and log in with student user
        await Promise.all([
            page.waitForEvent('dialog').then(async dialog => {
                console.log('Dialog:', dialog.message());
                expect(dialog.message()).toBe('Login realizado com sucesso!');
                await dialog.accept();
            }),
            await loginPage.logIn({ email, password })
        ]);

        //Access rentals menu 
        await dashboardPage.clickOnMenu(dashboardPage.myRentalsMenuButton);
        await rentalsPage.verifyRentalsTitle();

        // Request new rental
        const today = new Date();
        const startDate = today.toISOString().split('T')[0]; // DD/MM/YYYY
        const endDateObj = new Date();
        endDateObj.setDate(today.getDate() + 7); // 7 days later
        const endDate = endDateObj.toISOString().split('T')[0]; // DD/MM/YYYY

        // Accept dialog and request rental
        await Promise.all([
            page.waitForEvent('dialog').then(async dialog => {
                console.log('Dialog:', dialog.message());
                expect(dialog.message()).toBe('Arrendamento solicitado com sucesso!');
                await dialog.accept();
            }),
            await rentalsPage.requestNewRental(fullBookTitle, startDate, endDate)
        ]);

        // Verify that the book appears in the rentals list using id    
        await rentalsPage.verifyRentedBookInList(bookId, 'PENDENTE');

        // Save rental id for approval
        const rentalId = await rentalsPage.getRentalIdByBookId(bookId);
        console.log(`Rental ID for book ID ${bookId} is ${rentalId}`);

        // Logout  user
        await dashboardPage.clickOnMenu(dashboardPage.logoutButton);
        await loginPage.verifyLoginPage();

        // Accept dialog and log in as employee to approve rental
        await Promise.all([
            page.waitForEvent('dialog').then(async dialog => {
                console.log('Dialog:', dialog.message());
                expect(dialog.message()).toBe('Login realizado com sucesso!');
                await dialog.accept();
            }),
            await loginPage.logInEmployeeUser()
        ]);

        //Access aprovals menu 
        await dashboardPage.clickOnMenu(dashboardPage.approvalsMenuButton);
        await approvalsPage.verifyApprovalsTitle();

        // Accept dialog and log in as employee to approve rental
        await Promise.all([
            page.waitForEvent('dialog').then(async dialog => {
                console.log('Dialog:', dialog.message());
                expect(dialog.message()).toBe('Confirmar aprovação do arrendamento #' + rentalId + '?');
                await dialog.accept();
            }),
            // Approve rental
            await approvalsPage.approveRental(userId, bookId, rentalId)
        ]);

        // Verify that the status changed to APROVADO   
        await rentalsPage.verifyRentedBookInList(bookId, 'APROVADO');

        // Summary log
        console.log('The rental with ID ' + rentalId + ' from user ID ' + userId + ' for book with ID ' + bookId + ' has been approved successfully.');

        // Clear local storage
        await page.evaluate(() => {
            localStorage.clear();
        });
    });

    //// EXTRA TESTS ////

    test('Rental rejection', async ({ page, request }) => {

        const loginPage = new LoginPage(page);
        const dashboardPage = new DashboardPage(page);
        const rentalsPage = new RentalsPage(page);
        const approvalsPage = new ApprovalsPage(page);
        //API request
        const bookFactory = new BookFactory(request);
        const userFactory = new UserFactory(request);

        // Create user via API
        const { response, userId, fullName, email, password } = await userFactory.registerTestUser();
        expect(response.status()).toBe(201); // Ensure user was created
        console.log(`Created user: ${fullName} with email: ${email}`); // Log user info

        // Use API to create more book
        const bookResponse = await bookFactory.createBookTest();
        expect(bookResponse.status()).toBe(201); // Ensure book was created
        const book = await bookResponse.json();
        console.log(`Created book: ${book.nome} by ${book.autor}`); // Log book info
        const fullBookTitle = `${book.nome} (${book.autor})`;
        const bookId = book.id;

        //Open login page
        await loginPage.goToWebsite();

        // Accept dialog and log in with student user
        await Promise.all([
            page.waitForEvent('dialog').then(async dialog => {
                console.log('Dialog:', dialog.message());
                expect(dialog.message()).toBe('Login realizado com sucesso!');
                await dialog.accept();
            }),
            await loginPage.logIn({ email, password })
        ]);

        //Access rentals menu 
        await dashboardPage.clickOnMenu(dashboardPage.myRentalsMenuButton);
        await rentalsPage.verifyRentalsTitle();

        // Request new rental
        const today = new Date();
        const startDate = today.toISOString().split('T')[0]; // DD/MM/YYYY
        const endDateObj = new Date();
        endDateObj.setDate(today.getDate() + 7); // 7 days later
        const endDate = endDateObj.toISOString().split('T')[0]; // DD/MM/YYYY

        // Accept dialog and request rental
        await Promise.all([
            page.waitForEvent('dialog').then(async dialog => {
                console.log('Dialog:', dialog.message());
                expect(dialog.message()).toBe('Arrendamento solicitado com sucesso!');
                await dialog.accept();
            }),
            await rentalsPage.requestNewRental(fullBookTitle, startDate, endDate)
        ]);

        // Verify that the book appears in the rentals list using id    
        await rentalsPage.verifyRentedBookInList(bookId, 'PENDENTE');

        // Save rental id for approval
        const rentalId = await rentalsPage.getRentalIdByBookId(bookId);
        console.log(`Rental ID for book ID ${bookId} is ${rentalId}`);

        // Logout  user
        await dashboardPage.clickOnMenu(dashboardPage.logoutButton);
        await loginPage.verifyLoginPage();

        // Accept dialog and log in as employee to approve rental
        await Promise.all([
            page.waitForEvent('dialog').then(async dialog => {
                console.log('Dialog:', dialog.message());
                expect(dialog.message()).toBe('Login realizado com sucesso!');
                await dialog.accept();
            }),
            await loginPage.logInEmployeeUser()
        ]);

        //Access aprovals menu 
        await dashboardPage.clickOnMenu(dashboardPage.approvalsMenuButton);
        await approvalsPage.verifyApprovalsTitle();

        // Accept dialog and log in as employee to reject rental
        await Promise.all([
            page.waitForEvent('dialog').then(async dialog => {
                console.log('Dialog:', dialog.message());
                expect(dialog.message()).toBe('Confirmar rejeição do arrendamento #' + rentalId + '?');
                await dialog.accept();
            }),
            // Reject rental
            await approvalsPage.rejectRental(userId, bookId, rentalId)
        ]);

        // Verify that the status changed to REJEITADO
        await rentalsPage.verifyRentedBookInList(bookId, 'REJEITADO');

        // Summary log
        console.log('The rental with ID ' + rentalId + ' from user ID ' + userId + ' for book with ID ' + bookId + ' has been rejected successfully.');

        // Clear local storage
        await page.evaluate(() => {
            localStorage.clear();
        });
    });
});