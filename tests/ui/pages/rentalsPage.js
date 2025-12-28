import { expect } from "@playwright/test";

export class RentalsPage {
    constructor(page) {
        this.page = page;
        this.rentalsPageTitle = page.locator('h1', { hasText: '📅 Meus Arrendamentos' });
        this.selectBookDropdown = page.locator('select[id = "livroSelect"]');
        this.startDateDropdown = page.locator('input[id = "dataInicio"]');
        this.endDateDropdown = page.locator('input[id = "dataFim"]');
        this.requestRentalButton = page.locator('button[type="submit"]', { hasText: 'Solicitar Arrendamento' });
        this.rentalBooksGrid = page.locator('#lista-arrendamentos .book-card');
    };

    async verifyRentalsTitle() {
        await expect(this.rentalsPageTitle).toBeVisible();
        await expect(this.page).toHaveURL(/arrendamentos\.html$/);
    };

    async requestNewRental(bookTitle, startDate, endDate) {
        // Wait for the book to be available in the dropdown
        await this.selectBookDropdown.click();
        await this.selectBookDropdown.selectOption({ label: bookTitle });
        await this.startDateDropdown.fill(startDate); // Fill dropdown
        await this.endDateDropdown.fill(endDate);
        await this.requestRentalButton.click();
    };

    async verifyRentedBookInList(bookID, status) {
        await this.page.reload({ waitUntil: 'networkidle' });
        const rentedBook = this.page.locator('.book-card', { hasText: new RegExp(`Livro ID: ${bookID}`) });
        const rentedBookStatus = rentedBook.locator('p', { hasText: `Status: ${status}` });
        await expect(rentedBook).toBeVisible({ timeout: 10000 });
        await expect(rentedBookStatus).toBeVisible({ timeout: 10000 });
    };

    async getRentalIdByBookId(bookId) {
        // Locate the card with the specific book ID
        const cardTitle = this.page.locator('.book-card', { hasText: `Livro ID: ${bookId}` })
            .locator('h3'); //  And the rental ID is in the h3 element within the card
            const text = await cardTitle.innerText(); // Ex: "Arrendamento #25"
            // Extract the rental ID number from the text
        const rentalId = text.replace(/\D/g, "");
        return rentalId;
    };
};