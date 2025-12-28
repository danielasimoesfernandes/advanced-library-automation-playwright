///////////////////////////////////
///////////// 4. BOOKS ////////////
///////////////////////////////////
 
// @ts-check
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/dashboardPage';
import { BooksPage } from '../pages/booksPage';
import { BooksService } from '../../api/services/booksService';
import { BookFactory } from '../../api/factories/bookFactory';
import { BooksDetailsPage } from '../pages/bookDetailsPage';


test.describe('Book Tests', () => {
    test('CT-FE-010 - Add a book', async ({ page, request }) => {

        const loginPage = new LoginPage(page);
        const dashboardPage = new DashboardPage(page);
        const booksPage = new BooksPage(page);

        // @ts-ignore
        const booksService = new BooksService(request);

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

        //Go to Books menu
        await dashboardPage.clickOnMenu(dashboardPage.booksMenuButton);
        await booksPage.verifyBooksTitle();


        const uniqueId = Math.floor(Math.random() * 100);

        //Fill form to add a book 
        const book = {
            bookName: `O Hobbit ${uniqueId}`,
            authorName: "J.R.R. Tolkien",
            pages: "310",
            description: "Great book!",
            urlImage: `https://picsum.photos/seed/${uniqueId}/200/300`,
            stock: "5",
            price: "39.9"
        }

        // Accept dialog after adding a book
        await Promise.all([
            page.waitForEvent('dialog').then(async dialog => {
                console.log('Dialog:', dialog.message());
                expect(dialog.message()).toBe('Livro adicionado com sucesso!');
                await dialog.accept();
            }),
            // Add book
            await booksPage.fillFormToAddBook(book),
            console.log(book)
        ]);

        //Validate fields are empty 
        await booksPage.validatAddBookFieldsAfterSubmit();

        //Click in books menu again to check if new book is there
        await dashboardPage.clickOnMenu(dashboardPage.booksMenuButton);
        await booksPage.verifyBooksTitle();

        const bookCard = booksPage.getBookByTitle(book.bookName);
        await expect(bookCard).toContainText(book.bookName);
        await expect(bookCard).toContainText(book.authorName);

        // Clear locaStorage to avoid interference with other tests
        await page.evaluate(() => {
            localStorage.clear();
        });
    });


    // @ts-ignore
    test('CT-FE-011 - Validate all mandatory fields for book creation', async ({ page, request }) => {

        const loginPage = new LoginPage(page);
        const dashboardPage = new DashboardPage(page);
        const booksPage = new BooksPage(page)

        //Open login page
        await loginPage.goToWebsite();

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

        //Acces books menu 
        await dashboardPage.clickOnMenu(dashboardPage.booksMenuButton);
        await booksPage.verifyBooksTitle();

        //Fill form to add a book 
        // @ts-ignore
        const book = {
            bookName: "",
            authorName: "",
            pages: "",
            description: "",
            urlImage: "",
            stock: "",
            price: ""
        }

        // Try to submit empty form
        await booksPage.addBookButton.click();

        // Check HTML5 validation message for first required field
        // @ts-ignore
        const bookNameValidation = await booksPage.bookNameField.evaluate(input => input.validationMessage);
        console.log("Validation message for book name:", bookNameValidation);
        expect(bookNameValidation).toBe("Please fill out this field."); // ou "" dependendo do idioma do navegador

        // Fill first field and try submitting again
        await booksPage.bookNameField.fill("O Hobbit");
        await booksPage.authorNameField.fill("J.R.R. Tolkien");

        // Submit again
        await booksPage.addBookButton.click();

        // Check validation message for next required field
        // @ts-ignore
        const pagesValidation = await booksPage.pagesField.evaluate(input => input.validationMessage);
        console.log("Validation message for author:", pagesValidation);
        expect(pagesValidation).toBe("Please fill out this field.");

        // Clear locaStorage to avoid interference with other tests
        await page.evaluate(() => {
            localStorage.clear();
        });
    });


    test('CT-FE-012 - Validate book details', async ({ page, request }) => {

        const loginPage = new LoginPage(page);
        const dashboardPage = new DashboardPage(page);
        const booksPage = new BooksPage(page);
        const booksDetailsPage = new BooksDetailsPage(page);

        //API request
        const bookFactory = new BookFactory(request);

        // Use API to create more book
        const response = await bookFactory.createBookTest();
        expect(response.status()).toBe(201); // Ensure book was created
        const book = await response.json();
        console.log(`Created book: ${book.nome} by ${book.autor}`); // Log book info

        //Open login page
        await loginPage.goToWebsite();

        /// Accept dialog 
        await Promise.all([
            page.waitForEvent('dialog').then(async dialog => {
                console.log('Dialog:', dialog.message());
                expect(dialog.message()).toBe('Login realizado com sucesso!');
                await dialog.accept();
            }),
            // Log in with student user 
            await loginPage.logInStudentUser()
        ]);

        //Access books menu 
        await dashboardPage.clickOnMenu(dashboardPage.booksMenuButton);
        await page.reload();
        await booksPage.verifyBooksTitle();

        // Clicar no card do livro criado
        const bookCard = booksPage.getBookByTitle(book.nome).first();
        await bookCard.click();

        const bookId = book.id; 
        // Verify book details page
        await booksDetailsPage.verifyBooksDetailsTitle(bookId);
        console.log(`Book ID: ${bookId}`);

        // Check book details
        await booksDetailsPage.verifyBookDetails({
            bookName: book.nome,
            authorName: book.autor,
            pages: book.paginas.toString(),
            description: book.descricao,
            urlImage: book.imagemUrl
        }); 

        // Verify buttons are visible
        await expect(booksDetailsPage.favoriteButton).toBeVisible();
        await expect(booksDetailsPage.deleteButton).toBeVisible();
        await expect(booksDetailsPage.goBackButton).toBeVisible();  

        // Clear locaStorage to avoid interference with other tests
        await page.evaluate(() => {
            localStorage.clear();
        });
    });
});
