// @ts-check
import { test, expect } from '@playwright/test';


test.describe('Book Rentals', () => {
    test.skip('Add a new book to test rentals', async ({ request }) => {

        // Input data for book creation to use in rental tests 
        const body = {
            nome: "Rental Test Book 2",
            autor: "Tech Author Rentals",
            paginas: 124,
            descricao: "A book created to test rental functionality",
            imagemUrl: "https://exemplo.com/imagem.jpg",
            estoque: 5,
            preco: 49.9
        };

        // POST request to the /livros endpoint
        const response = await request.post('/livros', { data: body });

        // Validate the response status
        expect(response.status()).toBe(201);

        const newBookForRental = await response.json();

        console.log(newBookForRental);
    });


    test('CT-API-018 - Valid book rental', async ({ request }) => {

        // Use book created for rental tests --> id: 15 nome: "Rental Test Book"
        
        // Validate book stock before rental
        const bookResponse = await request.get('/livros/15');
        expect(bookResponse.status()).toBe(200);

        // Ensure the book has stock available
        const bookDetailsBeforeRental = await bookResponse.json();
        if (bookDetailsBeforeRental.estoque <= 0) {
            bookDetailsBeforeRental.estoque = 5; // Adjust stock for test purposes
            await request.put('/livros/15', { data: bookDetailsBeforeRental });
        }
        expect(bookDetailsBeforeRental.estoque).toBeGreaterThan(0);

        // Input data to book rental
        const body = {
            usuarioId: 3,
            livroId: 15,
            dataInicio: "2025-12-20",
            dataFim: "2025-12-27"
        };

        // POST request to the /arrendamentos endpoint to rent a book
        const response = await request.post('/arrendamentos', { data: body });
        // Validate the response status
        expect(response.status()).toBe(201);

        // Validate response body
        const rentalBookResponse = await response.json();
        expect(rentalBookResponse).toHaveProperty('id');
        expect(rentalBookResponse).toHaveProperty('usuarioId', body.usuarioId);
        expect(rentalBookResponse).toHaveProperty('livroId', body.livroId);
        expect(rentalBookResponse).toHaveProperty('status', 'PENDENTE');
        expect(rentalBookResponse).toHaveProperty('criadoEm');

        console.log("Rental details: ", rentalBookResponse);
    });


    test('CT-API-019 – Rental a book without stock (Failure)', async ({ request }) => {

        // Use book created for rental tests --> id: 15 nome: "Rental Test Book"
        const bookId = 15;

        // Validate book stock before rental
        const bookResponse = await request.get(`/livros/${bookId}`);
        expect(bookResponse.status()).toBe(200);

        // Ensure the book has stock available
        const bookDetails = await bookResponse.json();
        if (bookDetails.estoque > 0) {
            bookDetails.estoque = 0; // Adjust stock for test purposes
            await request.put(`/livros/${bookId}`, { data: bookDetails });
        }
        expect(bookDetails.estoque).toBe(0);

        // Input data to book rental
        const body = {
            usuarioId: 3,
            livroId: bookId,
            dataInicio: "2025-12-20",
            dataFim: "2025-12-27"
        };

        // POST request to the /arrendamentos endpoint to rent a book
        const bookWithoutStockResponse = await request.post('/arrendamentos', { data: body });
        // Validate the response status
        expect(bookWithoutStockResponse.status()).toBe(400);

        // Validate response body
        const rentalBookResponse = await bookWithoutStockResponse.json();
        expect(rentalBookResponse).toHaveProperty('mensagem', 'Livro sem estoque para arrendamento');

        console.log(rentalBookResponse);
    });


    test('CT-API-020 - Update rental status to approved', async ({ request }) => {

        // Use book created for rental tests --> id: 15 nome: "Rental Test Book"
        const bookId = 26;

        // Validate book stock before rental
        const bookResponse = await request.get(`/livros/${bookId}`);
        expect(bookResponse.status()).toBe(200);

        // Ensure the book has stock available
        const bookDetailsBeforeRental = await bookResponse.json();
        if (bookDetailsBeforeRental.estoque <= 0) {
            bookDetailsBeforeRental.estoque = 5; // Adjust stock for test purposes
            await request.put(`/livros/${bookId}`, { data: bookDetailsBeforeRental });
        }
        expect(bookDetailsBeforeRental.estoque).toBeGreaterThan(0);

        // Save initial stock for later validation
        const stockBeforeRental = bookDetailsBeforeRental.estoque;

        // Input data to book rental
        const bookRentalbody = {
            usuarioId: 3,
            livroId: bookId,
            dataInicio: "2025-12-20",
            dataFim: "2025-12-27"
        };

        // POST request to the /arrendamentos endpoint to rent a book
        const bookRentalResponse = await request.post('/arrendamentos', { data: bookRentalbody });
        // Validate the response status
        expect(bookRentalResponse.status()).toBe(201);
        const rentedBook = await bookRentalResponse.json();

         // Save rental id and stock after rental for later validation
        const rentalId = rentedBook.id;

        // Input data to update rental status
        const body = {
            status: "APROVADO"
        };

        // PUT request to the /arrendamentos/{id}/status endpoint to rent a book
        const response = await request.put(`/arrendamentos/${rentalId}/status`, { data: body });
        // Validate the response status
        expect(response.status()).toBe(200);

        // Validate book stock after rental
        const bookStockAfterRentalResponse = await request.get('/livros/' + bookId);
        expect(bookStockAfterRentalResponse.status()).toBe(200);
        const stockAfterRental = (await bookStockAfterRentalResponse.json()).estoque;

        // Validate that stock decreased by 1
        console.log("Stock before rental: ", stockBeforeRental, " -> Stock after rental: ", stockAfterRental, ".");
        expect(stockAfterRental).toBe(stockBeforeRental - 1);
    });


    test('CT-API-021 - Update rental status to invalid status', async ({ request }) => {

        // Use book created for rental tests --> id: 15 nome: "Rental Test Book"
        const bookId = 26;

        // Input data to book rental
        const bookRentalbody = {
            usuarioId: 3,
            livroId: bookId,
            dataInicio: "2025-12-20",
            dataFim: "2025-12-27"
        };

        // POST request to the /arrendamentos endpoint to rent a book
        const bookRentalResponse = await request.post('/arrendamentos', { data: bookRentalbody });
        // Validate the response status
        expect(bookRentalResponse.status()).toBe(201);
        const rentedBook = await bookRentalResponse.json();

         // Save rental id and stock after rental for later validation
        const rentalId = rentedBook.id;

        // Input data to update rental status
        const body = {
            status: "EM_ANALISE"
        };

        // PUT request to the /arrendamentos/{id}/status endpoint to rent a book
        const response = await request.put(`/arrendamentos/${rentalId}/status`, { data: body });
        // Validate the response status
        expect(response.status()).toBe(400);

        // Validate message
        const invalidStatusResponse = await response.json();
        expect(invalidStatusResponse).toHaveProperty('mensagem', 'Status inválido');

        console.log(invalidStatusResponse);
    });


    test('CT-API-022 - List all rentals from a user', async ({ request }) => {

        // GET request to the /arrendamentos/me?usuarioId=3 endpoint
        const response = await request.get('/arrendamentos/me?usuarioId=3');

        // Validate the response status
        expect(response.status()).toBe(200);

        // Validate format of array
        const listOfRentals = await response.json();
        expect(Array.isArray(listOfRentals)).toBe(true);

        // Validate each rental belongs to the user
        for (const rental of listOfRentals) {
            expect(rental).toHaveProperty('usuarioId', 3);
        };

        console.log(listOfRentals);
    });

});