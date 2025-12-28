////////////////////////////////////////
//////////// 7. PURCHASES //////////////
////////////////////////////////////////

import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/dashboardPage';
import { RentalsPage } from '../pages/rentalsPage';
import { BookFactory } from '../../api/factories/bookFactory';
import { UserFactory } from '../../api/factories/userFactory';
import { ApprovalsPage } from '../pages/approvalsPage';
import { PurchasesPage } from '../pages/purchasesPage';
import { BooksPage } from '../pages/booksPage';

test.describe('Purchases tests', () => {
    test('CT-FE-018 - Purchase a book', async ({ page, request }) => {
        // Create a new user via API    
         const loginPage = new LoginPage(page);
        const dashboardPage = new DashboardPage(page);
        const rentalsPage = new RentalsPage(page);
        const purchasesPage = new PurchasesPage(page);
        const booksPage = new BooksPage(page);
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
        console.log(`Created book: ${book.nome} by ${book.autor} (ID: ${book.id})`); // Log book info
        const bookTitle = book.nome;
        const bookAuthor = book.autor;
        const bookId = book.id;

        //Open login page
        await loginPage.goToWebsite();

        // Accept dialog and log in with user
        await Promise.all([
            page.waitForEvent('dialog').then(async dialog => {
                console.log('Dialog:', dialog.message());
                expect(dialog.message()).toBe('Login realizado com sucesso!');
                await dialog.accept();
            }),
            await loginPage.logIn({ email, password })
        ]);

        // Verify dashboard page
        await dashboardPage.verifyDashboardTitle();

        // Navigate to Books page to verify stock
        await dashboardPage.clickOnMenu(dashboardPage.booksMenuButton);
        await booksPage.verifyBooksTitle();
        // Locate the book card
        const bookCard = booksPage.bookCard(bookTitle, bookAuthor);
        
        // Get initial stock
        const initialStockText = await bookCard.locator('p', { hasText: /Estoque:/ }).innerText();
        const initialStock = parseInt(initialStockText.replace(/\D/g, ''));
        console.log(`Initial stock for "${bookTitle}": ${initialStock}`);

        // Navigate to Purchases page
        await dashboardPage.clickOnMenu(dashboardPage.purchasesMenuButton);
        await purchasesPage.verifyPurchasesTitle();

        // Verify stock is sufficient
        const quantityToPurchase = 1;

        // Accept dialog and purchase the book
        await Promise.all([
            page.waitForEvent('dialog').then(async dialog => {
                console.log('Dialog:', dialog.message());
                expect(dialog.message()).toBe('Compra registrada com sucesso! Aguarde aprovação.');
                await dialog.accept();
            }),
        // Purchase the book
        await purchasesPage.purchaseBook(bookTitle, bookAuthor, quantityToPurchase)
        ]);

        // Validate the stock remains the same in Books page (since purchase is pending)
        await dashboardPage.clickOnMenu(dashboardPage.booksMenuButton);
        await booksPage.verifyBooksTitle();

        // Get final stock
        const finalStockText = await bookCard.locator('p', { hasText: /Estoque:/ }).innerText();
        const finalStock = parseInt(finalStockText.replace(/\D/g, ''));
        console.log(`Final stock for "${bookTitle}": ${finalStock}`);
        expect(finalStock).toBe(initialStock);
        console.log(`Book stock, while purchase is pending, remains the same, initial stock ${initialStock} is the same as final stock ${finalStock}`);

        // Purchase status is "PENDENTE"
        await dashboardPage.clickOnMenu(dashboardPage.myPurchasesMenuButton);
        // Verify purchase status
        const myPurchaseCard = page.locator('.book-card', { hasText: bookId }).last(); 
        await expect(myPurchaseCard).toBeVisible();
        await expect(myPurchaseCard).toContainText('PENDENTE');
        
        console.log(`The status of the book "${bookTitle}" purchase is PENDENTE.`);

        // Clear locaStorage to avoid interference with other tests
        await page.evaluate(() => {
            localStorage.clear();
        }); 
    });

    test('CT-FE-019 - Book purchase approval', async ({ page, request }) => {
        // Create a new user via API    
         const loginPage = new LoginPage(page);
        const dashboardPage = new DashboardPage(page);
        const rentalsPage = new RentalsPage(page);
        const purchasesPage = new PurchasesPage(page);
        const booksPage = new BooksPage(page);
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
        console.log(`Created book: ${book.nome} by ${book.autor} (ID: ${book.id})`); // Log book info
        const bookTitle = book.nome;
        const bookAuthor = book.autor;
        const bookId = book.id;

        //Open login page
        await loginPage.goToWebsite();

        // Accept dialog and log in with user
        await Promise.all([
            page.waitForEvent('dialog').then(async dialog => {
                console.log('Dialog:', dialog.message());
                expect(dialog.message()).toBe('Login realizado com sucesso!');
                await dialog.accept();
            }),
            await loginPage.logIn({ email, password })
        ]);

        // Verify dashboard page
        await dashboardPage.verifyDashboardTitle();

        // Navigate to Books page to verify stock
        await dashboardPage.clickOnMenu(dashboardPage.booksMenuButton);
        await booksPage.verifyBooksTitle();
        // Locate the book card
        const bookCard = booksPage.bookCard(bookTitle, bookAuthor);
        
        // Get initial stock
        const initialStockText = await bookCard.locator('p', { hasText: /Estoque:/ }).innerText();
        const initialStock = parseInt(initialStockText.replace(/\D/g, ''));
        console.log(`Initial stock for "${bookTitle}": ${initialStock}`);

        // Navigate to Purchases page
        await dashboardPage.clickOnMenu(dashboardPage.purchasesMenuButton);
        await purchasesPage.verifyPurchasesTitle();

        // Verify stock is sufficient
        const quantityToPurchase = 1;

        // Accept dialog and purchase the book
        await Promise.all([
            page.waitForEvent('dialog').then(async dialog => {
                console.log('Dialog:', dialog.message());
                expect(dialog.message()).toBe('Compra registrada com sucesso! Aguarde aprovação.');
                await dialog.accept();
            }),
        // Purchase the book
        await purchasesPage.purchaseBook(bookTitle, bookAuthor, quantityToPurchase)
        ]);

        // Logout and log in as admin to approve the purchase
        await dashboardPage.logout();
        await loginPage.verifyLoginPage();

        // Accept dialog and log in with admin user
        await Promise.all([
            page.waitForEvent('dialog').then(async dialog => {
                console.log('Dialog:', dialog.message());
                expect(dialog.message()).toBe('Login realizado com sucesso!');
                await dialog.accept();
            }),
        await loginPage.logInAdminUser()
        ]); 

        // Verify dashboard page 
        await dashboardPage.verifyDashboardTitle();
        // Go to Purchases Admin page
        await dashboardPage.clickOnMenu(dashboardPage.adminPurchasesMenuButton);
        await purchasesPage.verifyAdminPurchasesTitle();

        // Save purchase id for approval
        const purchaseId = await purchasesPage.getPurchaseIdByBookId(bookId);
        console.log(`Purchase ID for book ID ${bookId} is ${purchaseId}`);

        // Accept dialog and approve the purchase
        await Promise.all([
            page.waitForEvent('dialog').then(async dialog => {
                console.log('Dialog:', dialog.message());
                expect(dialog.message()).toBe('Confirmar alteração da compra #' + purchaseId + ' para APROVADA?');
                await dialog.accept();
            }),
        // Approve the purchase
        await purchasesPage.approvePurchase(userId, bookId, purchaseId)
        ]);

        // Validate stock is reduced in Books page after approval
        await dashboardPage.clickOnMenu(dashboardPage.booksMenuButton);
        await page.reload({ waitUntil: 'networkidle' }); // Ensure page is fully loaded
        await booksPage.verifyBooksTitle();

        // Get final stock
        const finalStockText = await bookCard.locator('p', { hasText: /Estoque:/ }).innerText();
        const finalStock = parseInt(finalStockText.replace(/\D/g, ''));
        console.log(`Final stock for "${bookTitle}": ${finalStock}`);
        expect(finalStock).toBe(initialStock - quantityToPurchase);
        console.log(`Book stock, after purchase is approved, is reduced, final stock is ${finalStock} (initial stock ${initialStock} - purchased quantity ${quantityToPurchase})`);

        // Verify purchase status
        await dashboardPage.clickOnMenu(dashboardPage.adminPurchasesMenuButton);
        const myPurchaseCard = page.locator('.book-card', { hasText: `Compra #${purchaseId}` }); // Locate the specific purchase card
        await expect(myPurchaseCard).toBeVisible();
        await expect(myPurchaseCard).toContainText('APROVADA');
        
        console.log(`The status of the book "${bookTitle}" purchase is APROVADA.`);

        // Clear locaStorage to avoid interference with other tests
        await page.evaluate(() => {
            localStorage.clear();
        });
    });
});