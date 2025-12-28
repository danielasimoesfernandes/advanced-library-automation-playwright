import { expect } from "@playwright/test";

export class FavoritesPage {
    constructor(page) {
        this.page = page;
        this.favoritesPageTitle = page.locator('h1', { hasText: '❤️ Meus Favoritos' });
        this.noFavoritesMessage = page.locator('[id="mensagem-vazio"]');
        this.favoriteBooksGrid = page.locator('.favorites-grid .book-card');
    };

    async verifyFavoritesTitle() {
        await expect(this.favoritesPageTitle).toBeVisible();
        await expect(this.page).toHaveURL(/favoritos\.html$/);
    };

    async verifyNoFavoritesMessage() {
        await this.noFavoritesMessage.waitFor({ state: 'visible', timeout: 5000 });
        await expect(this.noFavoritesMessage).toBeVisible();
        await expect(this.noFavoritesMessage).toContainText('Você ainda não tem livros favoritos');
    };

    getFavoriteBook(bookName, author, pages) {
        return this.page.locator('.book-card').filter({
            hasText: bookName
        }).filter({
            hasText: author
        }).filter({
            hasText: pages.toString()
        });
    };
};