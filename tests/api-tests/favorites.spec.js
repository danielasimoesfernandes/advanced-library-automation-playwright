// @ts-check
import { test, expect } from '@playwright/test';


test.describe('Favorites Management', () => {
    test.skip('Add a new book to test favorites', async ({ request }) => {

        // Input data for book creation to use in rental tests 
        const body = {
            nome: "Favorites Test Book",
            autor: "Tech Author Fav",
            paginas: 567,
            descricao: "A book created to test favorites functionality",
            imagemUrl: "https://exemplo.com/imagem.jpg",
            estoque: 3,
            preco: 69.9
        };

        // POST request to the /livros endpoint
        const response = await request.post('/livros', { data: body });

        // Validate the response status
        expect(response.status()).toBe(201);

        const newBookForFavorites = await response.json();

        console.log(newBookForFavorites);
    });
    
    test('CT-API-014 - Add a book to favorites', async ({ request }) => {

        // Use book ID 20 that was created for favorites tests

        // Input data to add favorite
        const body = {
            usuarioId: 1,
            livroId: 20
        };

        // DELETE request to the /favoritos endpoint to ensure clean state
        const deleteResponse = await request.delete('/favoritos', { data: body });
        // Accept 200 (deleted), or 404 (not found) beecause it may or not be in favorites
        expect([200, 404]).toContain(deleteResponse.status());

        // POST request to the /favoritos endpoint
        const response = await request.post('/favoritos', { data: body });

        // Validate the response status
        expect(response.status()).toBe(201);

        const favoriteBook = await response.json();

        // Validate the message
        expect(favoriteBook).toHaveProperty('mensagem', 'Livro adicionado aos favoritos');

        console.log(favoriteBook);
    });


    test('CT-API-015 – Add a book already in favorites (Failure)', async ({ request }) => {

        // Use book ID 20 that was created for favorites tests

        // Input data to add favorite
        const body = {
            usuarioId: 1,
            livroId: 20
        };

        // DELETE request to the /favoritos endpoint to ensure clean state
        const deleteResponse = await request.delete('/favoritos', { data: body });
        // Accept 200 (deleted), or 404 (not found) beecause it may or not be in favorites
        expect([200, 404]).toContain(deleteResponse.status());

        // POST request to the /favoritos endpoint to add the book first time
        const firstAddResponse = await request.post('/favoritos', { data: body });
        expect(firstAddResponse.status()).toBe(201);

        // POST request to the /favoritos endpoint to try to add the same book again to favorites 
        const secondAddResponse = await request.post('/favoritos', { data: body });
        expect(secondAddResponse.status()).toBe(400);

        // Validate the message
        const errorResponse = await secondAddResponse.json();
        expect(errorResponse).toHaveProperty('mensagem', 'Já está nos favoritos');

        console.log(errorResponse);
    });


    test('CT-API-016 - List user favorites', async ({ request }) => {

        // GET request to the /favoritos/1 endpoint to get favorites for user with ID 1
        const response = await request.get('/favoritos/1');

        // Validate the response status
        expect(response.status()).toBe(200);

        // Validate format of array
        const userFavorites = await response.json();
        expect(Array.isArray(userFavorites)).toBe(true);

        // Validate all favorites belong to the user
        if (userFavorites.length > 0) {
            for (const book of userFavorites) {
                expect(book).toHaveProperty('id');
                expect(book).toHaveProperty('nome');
                expect(book).toHaveProperty('autor');
                expect(book).toHaveProperty('paginas');
                expect(book).toHaveProperty('descricao');
                expect(book).toHaveProperty('imagemUrl');
                expect(book).toHaveProperty('dataCadastro');
                expect(book).toHaveProperty('estoque');
                expect(book).toHaveProperty('preco');
            }
        } else {
            console.log('User has no favorite books.');
        }

        console.log(userFavorites);
    });

    test('CT-API-017 - Remove book from favorites', async ({ request }) => {

        // Input data to add a book to library
        const addBookBody = {
            nome: "Book to be favorited",
            autor: "Some Author",
            paginas: 425,
            descricao: "A book to test favorites removal",
            imagemUrl: "https://exemplo.com/imagem.jpg",
            estoque: 2,
            preco: 39.9
        };

        // POST request to the /livros endpoint to add the book to library 
        const addBookToLibrary = await request.post('/livros', { data: addBookBody });
        expect(addBookToLibrary.status()).toBe(201);
        const newBook = await addBookToLibrary.json();
        const newBookId = newBook.id;

        // Input data to add and remove favorite
        const body = {
            usuarioId: 1,
            livroId: newBookId
        };

        // POST request to the /favoritos endpoint to ensure the book is in favorites
        const addToFavorites = await request.post('/favoritos', { data: body });
        expect(addToFavorites.status()).toBe(201); // Accept 201 - added to favorites

        // Delete the book from favorites
        const deleteFromFavorites = await request.delete('/favoritos', { data: body });
        expect(deleteFromFavorites.status()).toBe(200); // Accept 200 - deleted from favorites

        // Validate the message
        const deleteFromFavoritesResponse = await deleteFromFavorites.json();
        expect(deleteFromFavoritesResponse).toHaveProperty('mensagem', 'Livro removido dos favoritos');

        console.log(deleteFromFavorites);
    });
});