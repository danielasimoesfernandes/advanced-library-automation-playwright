// @ts-check
import { test, expect } from '@playwright/test';


test.describe('Purchases', () => {
    test('Add a new book to test purchases', async ({ request }) => {

        // Input data for book creation to use in purchase tests 
        const body = {
            nome: "Purchase Test Book 4",
            autor: "Author Pur",
            paginas: 347,
            descricao: "A book created to test purchase functionality - part 4",
            imagemUrl: "https://exemplo.com/imagem.jpg",
            estoque: 16,
            preco: 57.0
        };

        // POST request to the /livros endpoint
        const response = await request.post('/livros', { data: body });

        // Validate the response status
        expect(response.status()).toBe(201);

        const newBookForPurchase = await response.json();

        console.log(newBookForPurchase);
    });


    test('CT-API-023 - Purchase with stock available', async ({ request }) => {

        // Use book created for purchase tests --> id: 40 nome: "Purchase Test Book 2"
        const bookId = 3;
        
        // Validate book stock before purchase
        const bookResponse = await request.get('/livros/' + bookId);
        expect(bookResponse.status()).toBe(200);

        // Ensure the book has stock available
        const bookDetailsBeforePurchase = await bookResponse.json();
        if (bookDetailsBeforePurchase.estoque <= 0) {
            bookDetailsBeforePurchase.estoque = 10; // Adjust stock for test purposes
            await request.put('/livros/' + bookId, { data: bookDetailsBeforePurchase });
        }
        expect(bookDetailsBeforePurchase.estoque).toBeGreaterThan(0);

        // Input data to book purchase
        const body = {
            usuarioId: 3,
            livroId: bookId,
            quantidade: 2
        };

        // POST request to the /compras endpoint to rent a book
        const response = await request.post('/compras', { data: body });
        // Validate the response status
        expect(response.status()).toBe(201);

        // Validate response body
        const purchaseBookResponse = await response.json();
        expect(purchaseBookResponse).toHaveProperty('status', 'PENDENTE');
        expect(purchaseBookResponse).toHaveProperty('total', bookDetailsBeforePurchase.preco * body.quantidade);

        console.log("Purchase status: ", purchaseBookResponse.status);
        console.log("Purchase total: ", bookDetailsBeforePurchase.preco, " X ", body.quantidade, " = ", purchaseBookResponse.total);
        
    });


    test('CT-API-019 – Rental a book without stock (Failure)', async ({ request }) => {

        // Use book created for purchase tests --> id: 40 nome: "Purchase Test Book 2"
        const bookId = 4;
        
        // Validate book stock before purchase
        const bookResponse = await request.get('/livros/' + bookId);
        expect(bookResponse.status()).toBe(200);

        // Input data to book purchase
        const body = {
            usuarioId: 3,
            livroId: bookId,
            quantidade: 5
        };

        // Ensure the book has stock available
        const bookDetailsBeforePurchase = await bookResponse.json();
        if (bookDetailsBeforePurchase.estoque > body.quantidade) {
            bookDetailsBeforePurchase.estoque = body.quantidade - 1; // Adjust stock for test purposes
            await request.put('/livros/' + bookId, { data: bookDetailsBeforePurchase });
        }
        expect(bookDetailsBeforePurchase.estoque).toBeLessThan(body.quantidade);


        // POST request to the /compras endpoint to rent a book
        const response = await request.post('/compras', { data: body });
        // Validate the response status
        expect(response.status()).toBe(400);

        // Validate response body
        const purchaseBookResponse = await response.json();
        expect(purchaseBookResponse).toHaveProperty('mensagem', 'Estoque insuficiente');
      
        console.log(purchaseBookResponse);
        
    });
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

