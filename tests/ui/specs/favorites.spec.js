////////////////////////////////////////
//////////// 5. FAVORITES //////////////
////////////////////////////////////////

// @ts-check
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/dashboardPage';
import { BooksPage } from '../pages/booksPage';
import { BooksDetailsPage } from '../pages/bookDetailsPage';
import { BookFactory } from '../../api/factories/bookFactory.js';
import { FavoritesPage } from '../pages/favoritesPage.js';
import { FavoritesService } from '../../api/services/favoritesServices.js';
import { UserFactory } from '../../api/factories/userFactory.js';
import { CLIENT_LONG_PASSWORD } from 'mysql/lib/protocol/constants/client.js';

test.describe('Favorites Tests', () => {
    test('CT-FE-013 - Add a book to favorites', async ({ page, request }) => {
        const loginPage = new LoginPage(page);
        const dashboardPage = new DashboardPage(page);
        const booksPage = new BooksPage(page);
        const bookDetailsPage = new BooksDetailsPage(page);
        const favoritesPage = new FavoritesPage(page);
        //API request
        const bookFactory = new BookFactory(request);

        // Use API to create more book
        const response = await bookFactory.createBookTest();
        expect(response.status()).toBe(201); // Ensure book was created
        const book = await response.json();
        console.log(`Created book: ${book.nome} by ${book.autor}`); // Log book info

        //Open login page
        await loginPage.goToWebsite();

        // Accept dialog and log in with student user
        await Promise.all([
            page.waitForEvent('dialog').then(async dialog => {
                console.log('Dialog:', dialog.message());
                expect(dialog.message()).toBe('Login realizado com sucesso!');
                await dialog.accept();
            }),
            await loginPage.logInStudentUser()
        ]);

        //Access books menu 
        await dashboardPage.clickOnMenu(dashboardPage.booksMenuButton);
        
        await booksPage.verifyBooksTitle();

        // Clicar no card do livro criado
        const bookCard = booksPage.getBookByTitle(book.nome).first();
        await bookCard.click();

        // Add book to favorites
        await bookDetailsPage.verifyBooksDetailsTitle(book.id);

        // Accept success dialog and add book to favorites
        await Promise.all([
            page.waitForEvent('dialog').then(async dialog => {
                console.log('Dialog:', dialog.message());
                expect(dialog.message()).toBe('Adicionado aos favoritos!');
                await dialog.accept();
            }),
            await bookDetailsPage.addBookToFavorites()
        ]);

        // Verify add to favorites button changed to remove from favorites
        await expect(bookDetailsPage.favoriteButton).toBeHidden();
        await expect(bookDetailsPage.removeFavoriteButton).toBeVisible();

        // Go to Favorites page
        await dashboardPage.clickOnMenu(dashboardPage.favoritesMenuButton);
        await favoritesPage.verifyFavoritesTitle();

        // Verify the book is in favorites
        const favoriteBookCard = favoritesPage.getFavoriteBook(book.nome, book.autor, book.paginas).first();
        await expect(favoriteBookCard).toBeVisible();

        // Clear locaStorage to avoid interference with other tests
        await page.evaluate(() => {
            localStorage.clear();
        });
    });

    test('CT-FE-014 - Remove a book from favorites', async ({ page, request }) => {
        const loginPage = new LoginPage(page);
        const dashboardPage = new DashboardPage(page);
        const booksPage = new BooksPage(page);
        const bookDetailsPage = new BooksDetailsPage(page);
        const favoritesPage = new FavoritesPage(page);
        //API request
        const bookFactory = new BookFactory(request);

        // Use API to create more book
        const response = await bookFactory.createBookTest();
        expect(response.status()).toBe(201); // Ensure book was created
        const book = await response.json();
        const bookID = book.id;
        console.log(`Created book: ${book.nome} by ${book.autor}`); // Log book info

        //Open login page
        await loginPage.goToWebsite();

        // Accept dialog and log in with student user
        await Promise.all([
            page.waitForEvent('dialog').then(async dialog => {
                console.log('Dialog:', dialog.message());
                expect(dialog.message()).toBe('Login realizado com sucesso!');
                await dialog.accept();
            }),
            await loginPage.logInStudentUser()
        ]);

        //Access books menu 
        await dashboardPage.clickOnMenu(dashboardPage.booksMenuButton);
        await page.reload();    
        await booksPage.verifyBooksTitle();

        // Clicar no card do livro criado
        const bookCard = booksPage.getBookByTitle(book.nome).first();
        await bookCard.click();

        // Add book to favorites
        await bookDetailsPage.verifyBooksDetailsTitle(bookID);

        // Accept success dialog and add book to favorites
        await Promise.all([
            page.waitForEvent('dialog').then(async dialog => {
                console.log('Dialog:', dialog.message());
                expect(dialog.message()).toBe('Adicionado aos favoritos!');
                await dialog.accept();
            }),
            await bookDetailsPage.addBookToFavorites()
        ]);

        // Verify add to favorites button changed to remove from favorites
        await expect(bookDetailsPage.favoriteButton).toBeHidden();
        await expect(bookDetailsPage.removeFavoriteButton).toBeVisible();

        // Remove book from favorites
        await Promise.all([
            page.waitForEvent('dialog').then(async dialog => {
                console.log('Dialog:', dialog.message());
                expect(dialog.message()).toBe('Removido dos favoritos!');
                await dialog.accept();
            }),
            await bookDetailsPage.removeBookFromFavorites()
        ]);

        // Verify remove from favorites button changed to add to favorites
        await expect(bookDetailsPage.removeFavoriteButton).toBeHidden();
        await expect(bookDetailsPage.favoriteButton).toBeVisible();

        // Go to Favorites page
        await dashboardPage.clickOnMenu(dashboardPage.favoritesMenuButton);
        await favoritesPage.verifyFavoritesTitle();

        // Verify the book is in favorites
        const favoriteBookCard = favoritesPage.getFavoriteBook(book.nome, book.autor, book.paginas).first();
        await expect(favoriteBookCard).not.toBeVisible(); // Book should not be in favorites anymore
        await expect(favoriteBookCard).not.toBeAttached(); // Book element was completely removed from DOM

        // Clear locaStorage to avoid interference with other tests
        await page.evaluate(() => {
            localStorage.clear();
        });
    });

    test('CT-FE-015 - List all favorite books from a user', async ({ page, request }) => {

        const loginPage = new LoginPage(page);
        const dashboardPage = new DashboardPage(page);
        const favoritesPage = new FavoritesPage(page);
        const bookDetailsPage = new BooksDetailsPage(page);
        //API request
        const bookFactory = new BookFactory(request);
        const favoritesService = new FavoritesService(request);
        const userFactory = new UserFactory(request);

        // Use API to create more books to add them to favorites
        const response1 = await bookFactory.createBookTest();
        const book1 = await response1.json();
        const response2 = await bookFactory.createBookTest();
        const book2 = await response2.json();
        const response3 = await bookFactory.createBookTest();
        const book3 = await response3.json();
        console.log(`Created books: ${book1.nome}, ${book2.nome}, ${book3.nome}`); // Log book info

        // Use API to create new user   
        const { response, fullName, email, password } = await userFactory.registerTestUser();
        expect(response.status()).toBe(201); // Ensure user was created
        console.log(`Created user: ${fullName} with email: ${email}`); // Log user info

        // Open login page
        await loginPage.goToWebsite();

        // Accept dialog 
        await Promise.all([
            page.waitForEvent('dialog').then(async dialog => {
                console.log('Dialog:', dialog.message());
                expect(dialog.message()).toBe('Login realizado com sucesso!');
                await dialog.accept();
            }),
            // Log in with personal user 
            await loginPage.logIn({ email, password})
        ]);
        // Verify the user is logged in 
        await dashboardPage.verifyDashboardTitle();

        // Get userId from localStorage
        // @ts-ignore
        const loggedUser = await page.evaluate(() => JSON.parse(localStorage.getItem('usuario')));
        const userId = loggedUser.id;

        // Add books created to favorites using API
        await favoritesService.addBookToFavorites({ usuarioId: userId, livroId: book1.id });
        await favoritesService.addBookToFavorites({ usuarioId: userId, livroId: book2.id });
        await favoritesService.addBookToFavorites({ usuarioId: userId, livroId: book3.id });

        // Go to Favorites page
        await dashboardPage.clickOnMenu(dashboardPage.favoritesMenuButton);
        await favoritesPage.verifyFavoritesTitle();

        // Verify all favorite books are listed
        for (const book of [book1, book2, book3]) {
            const favoriteBookCard = favoritesPage.getFavoriteBook(book.nome, book.autor, book.paginas).first();
            await expect(favoriteBookCard).toBeVisible();
            console.log(`Verified favorite book: ${book.nome}`); // Log verification
        };

        // Remove all books from favorites to using API to clean up
        for (const book of [book1, book2, book3]) {
            await favoritesService.removeBookFromFavorites({ usuarioId: userId, livroId: book.id });
        };

        // Verify all favorite books are removed
        await page.reload({ waitUntil: 'networkidle' });
        await expect(page.locator('.book-card')).toHaveCount(0);
        await favoritesPage.verifyNoFavoritesMessage();
        console.log('Verified all favorite books were removed'); // Log verification

        // Clear locaStorage to avoid interference with other tests
        await page.evaluate(() => {
            localStorage.clear();
        });
    });

});


