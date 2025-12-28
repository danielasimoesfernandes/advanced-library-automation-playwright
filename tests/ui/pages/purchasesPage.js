import { expect } from "@playwright/test";

export class PurchasesPage {
    constructor(page) {
        this.page = page;
        this.purchasesPageTitle = page.locator('h1', { hasText: '🛒 Compras' });
        this.adminPurchasesPageTitle = page.locator('h1', { hasText: '📦 Compras - Administração' });
        // Function to locate a book card by title and author to simple user
        this.userBookCard = (title, author) => 
            page.locator('.book-card')
                .filter({ hasText: title })
                .filter({ hasText: author });

        // Function to locate a book card by userId, bookID and purchaseId for admin user
        this.adminPurchaseCard = (userId, bookId, purchaseId) => 
            page.locator('.book-card')
                .filter({ hasText: `Compra #${purchaseId}` })
                .filter({ hasText: `Usuário ID: ${userId}` })
                .filter({ hasText: `Livro ID: ${bookId}` });
        this.approvalButton = (userId, bookID, purchaseId) => this.adminPurchaseCard(userId, bookID, purchaseId).getByRole('button', { name: 'Aprovar' });
        this.cancelationButton = (userId, bookID, purchaseId) => this.adminPurchaseCard(userId, bookID, purchaseId).getByRole('button', { name: 'Cancelar' });
    };

    async verifyPurchasesTitle() {
        await expect(this.purchasesPageTitle).toBeVisible();
        await expect(this.page).toHaveURL(/compras\.html$/);
    };

    async verifyAdminPurchasesTitle() {
        await expect(this.adminPurchasesPageTitle).toBeVisible();
        await expect(this.page).toHaveURL(/compras-admin\.html$/);
    };

    async purchaseBook(bookTitle, bookAuthor, quantity) {
        const card = this.userBookCard(bookTitle, bookAuthor);
        await card.locator('input[type="number"]').fill(quantity.toString());  
        await card.locator('button', { hasText: 'Comprar' }).click();
    };

    async approvePurchase(userId, bookId, purchaseId) {
        await this.approvalButton(userId, bookId, purchaseId).scrollIntoViewIfNeeded();
        await this.approvalButton(userId, bookId, purchaseId).click();
    }

    async cancelPurchase(userId, bookId, purchaseId) {
        await this.cancelationButton(userId, bookId, purchaseId).scrollIntoViewIfNeeded();
        await this.cancelationButton(userId, bookId, purchaseId).click();
    };

    async getPurchaseIdByBookId(bookId) {
        // Locate the card with the specific book ID
        const cardTitle = this.page.locator('.book-card', { hasText: `Livro ID: ${bookId}` })
            .locator('h3'); //  And the purchase ID is in the h3 element within the card
            const text = await cardTitle.innerText(); // Ex: "Compra #25"
            // Extract the purchase ID number from the text
        const purchaseId = text.replace(/\D/g, "");
        return purchaseId;
    };
};