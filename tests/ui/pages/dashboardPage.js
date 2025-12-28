import { expect } from "@playwright/test";

export class DashboardPage {
    constructor(page) {
        this.page = page;
        this.dashboardPageTitle = page.locator('h1', { hasText: '📚 Minha Biblioteca' });
        this.username = page.locator('#nomeUsuario');
        this.dashboardMessage = page.locator('input[id = "msg-tipo"]')
        // Dynamic menu
        this.logoutButton = page.locator('button[class="nav-btn logout"]', { hasText: 'Sair' });
        this.dashboardMenuButton = page.locator('a.nav-btn[href="dashboard.html"]');
        this.booksMenuButton = page.locator('a.nav-btn[href="livros.html"]');
        this.favoritesMenuButton = page.locator('a.nav-btn[href="favoritos.html"]');
        this.myRentalsMenuButton = page.locator('a.nav-btn[href="arrendamentos.html"]');
        this.purchasesMenuButton = page.locator('a.nav-btn[href="compras.html"]');
        this.myPurchasesMenuButton = page.locator('a.nav-btn[href="minhas-compras.html"]');
        this.approvalsMenuButton = page.locator('a.nav-btn[href="aprovacoes.html"]');
        this.adminPurchasesMenuButton = page.locator('a.nav-btn[href="compras-admin.html"]');
        this.usersMenuButton = page.locator('a.nav-btn[href="admin-usuarios.html"]');
        // Stats cards
        this.statsGrid = page.locator('div[class="stats-grid"][id="stats"]');
        this.totalBooksCard = page.locator('.stat-card', { hasText: 'Total de Livros' });
        this.totalUsersCard = page.locator('.stat-card', { hasText: 'Total de Usuários' });
        this.availableBooksCard = page.locator('.stat-card', { hasText: 'Livros Disponíveis' });
        this.studentsCard = page.locator('.stat-card', { hasText: 'Alunos' });
        this.employeesCard = page.locator('.stat-card', { hasText: 'Funcionários' });
        this.adminsCard = page.locator('.stat-card', { hasText: 'Administradores' });
        this.registeredStudents = page.locator('.stat-card', { hasText: 'Alunos Cadastrados'});
        // Books grid
        this.availableBooksGrid = page.locator('.books-grid .book-card');
    };

    async getUsername() {
        return await this.username.textContent();
    };

    async usernameDisplayed() {
        return await this.username.isVisible();
    };

    async verifyDashboardTitle() {
        await expect(this.dashboardPageTitle).toBeVisible();
        await expect(this.page).toHaveURL(/dashboard\.html$/);
    };

    async verifyUserInLocalStorage(expectedEmail, expectedId, expectedName, expectedTipo) {
        const savedUser = await this.page.evaluate(() => JSON.parse(localStorage.getItem('usuario')));
        expect(savedUser).not.toBeNull();
        expect(savedUser.email).toBe(expectedEmail);
        expect(savedUser.id).toBe(expectedId);
        expect(savedUser.nome).toBe(expectedName);
        expect(savedUser.tipo).toBe(expectedTipo);
    };

    async verifyAllStatsCardsVisibleForAdmin() {
        await expect(this.statsGrid).toBeVisible();

        await expect(this.totalBooksCard).toBeVisible();
        await expect(this.totalUsersCard).toBeVisible();
        await expect(this.availableBooksCard).toBeVisible();
        await expect(this.studentsCard).toBeVisible();
        await expect(this.employeesCard).toBeVisible();
        await expect(this.adminsCard).toBeVisible();
    };

    async verifyAllStatsCardsVisibleForStudent() {
        await expect(this.statsGrid).toBeVisible();

        await expect(this.availableBooksCard).toBeVisible();
        await expect(this.totalBooksCard).toBeVisible();
        await expect(this.registeredStudents).toBeVisible();
    };

    async getStatValue(cardLocator) {
        const valueText = await cardLocator.locator('.number').textContent();
        return Number(valueText?.trim());
    };

    async clickOnMenu(menuButton) {
        await menuButton.click();
    };

    async logout() {
        await this.logoutButton.click();
    };

};




