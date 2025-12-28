import { expect } from "@playwright/test";

export class AdminUsersPage {
    constructor(page) {
        this.page = page;
        this.adminUsersPageTitle = page.locator('h1', { hasText: '👨‍💻 Administração de Usuários' });
        this.name = page.locator('input[id = "nome"]');
        this.email = page.locator('input[id = "email"]');
        this.password = page.locator('input[id = "senha"]');
        this.type = page.locator('#tipo');
        this.createUserButton = page.locator('button[type="submit"]', { hasText: 'Criar Usuário' });
        this.adminUsersForm = page.locator('form[id="form-novo-usuario"]');
        this.adminUsersTable = page.locator('table.table-usuarios');
    };
    // Table inputs
    nameInputTable(id) {
        return this.page.locator(`input[data-id="${id}"][data-campo="nome"]`);
    };

    emailInputTable(id) {
        return this.page.locator(`input[data-id="${id}"][data-campo="email"]`);
    };

    selectType(id) {
        return this.page.locator(`select[data-id="${id}"][data-campo="tipo"]`);
    };

    // Buttons
    saveButton(id) {
        return this.page.locator(`button[onclick="salvarUsuario(${id})"]`);
    };

    deleteButton(id) {
        return this.page.locator(`button[onclick="excluirUsuario(${id})"]`);
    };

    generateRandomUserDate(isEdit = false) {
        const firstNames = [
            'Ana', 'Bruno', 'Carlos', 'Daniela', 'Eduardo', 'Fernanda', 'Gabriel',
            'Helena', 'Iris', 'João', 'Katia', 'Luís', 'Mariana', 'Nuno', 'Joana', 'Paulo',
            'Olivia', 'Pedro', 'Raquel', 'Sergio', 'Teresa', 'Vítor', 'Henrique', 'Ines',
            'James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael',
            'Linda', 'David', 'Elizabeth', 'William', 'Barbara', 'Richard',
            'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'
        ];
        const lastNames = [
            'Silva', 'Santos', 'Ferreira', 'Pereira', 'Oliveira', 'Costa', 'Rodrigues',
            'Martins', 'Jesus', 'Sousa', 'Fernandes', 'Gonçalves', 'Gomes', 'Lopes',
            'Marques', 'Alves', 'Almeida', 'Ribeiro', 'Pinto', 'Carvalho', 'Simoes', 'Barbosa',
            'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
            'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzales',
            'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'
        ];
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const prefix = isEdit ? 'edited.' : '';
        const randomString = Math.random().toString(36).substring(2, 5);
        return {
            fullName: `${firstName} ${lastName}`,
            emailComplete: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${randomString}_${prefix}@teste.com`,
            password: "123456"
        };
    }


    async verifyAdminUsersTitle() {
        await expect(this.adminUsersPageTitle).toBeVisible();
        await expect(this.page).toHaveURL(/admin-usuarios\.html$/);
    };

    async registerNewUser(tipo = 'Aluno') { // e.g., 'Administrador', 'Funcionário', 'Aluno'
        const data = this.generateRandomUserDate();

        await this.name.fill(data.fullName);
        await this.email.fill(data.emailComplete);
        await this.password.fill(data.password);
        // If nothing is written, default is 'Aluno'
        await this.type.selectOption(tipo); 
        await this.createUserButton.click();
        return data;
    };
    async registerNewUserAdmin() {
        const data = this.generateRandomUserDate();
        await this.name.fill(data.fullName);
        await this.email.fill(data.emailComplete);
        await this.password.fill(data.password);
        await this.type.selectOption('Administrador'); // e.g., 'Administrador', 'Funcionário'
        await this.createUserButton.click();
        return data;
    };

    async registerNewUserEmployee() {
        const data = this.generateRandomUserDate();
        await this.name.fill(data.fullName);
        await this.email.fill(data.emailComplete);
        await this.password.fill(data.password);
        await this.type.selectOption('Funcionário'); // e.g., 'Administrador', 'Funcionário'
        await this.createUserButton.click();
        return data;
    };

    // async verifyUsersDataInTable(name, email, type, id = null) {
    //     await this.page.reload();
    //     // Find the email input that has exactly the value of the email parameter
    //     const emailInput = this.page.locator(`input[value="${email}"]`);
    //     await expect(emailInput).toBeVisible({ timeout: 10000 });
    //     // Find the row containing that email input and verify other fields
    //     const row = this.page.locator('tr').filter({ has: emailInput });
    //     await expect(row.locator('input[data-campo="nome"]')).toHaveValue(name);

    //     console.log(`Success: The ${name} was found in the table.`);
    // };

    async verifyUsersDataInTable(name, email, type, id, shouldExist = true) {
        await this.page.reload();
        // Find the row with the specific ID
        const row = this.page.locator('tr').filter({
            has: this.page.locator('td').first().filter({ hasText: new RegExp(`^${id}$`) })
        });
        // Validate the Name and Email
        if (shouldExist) {
            await expect(row.locator('input[data-campo="nome"]')).toHaveValue(name);
            await expect(row.locator('input[data-campo="email"]')).toHaveValue(email);
            // Validate the Type
            const typeValue = type === 'Administrador' ? '3' : (type === 'Funcionário' ? '2' : '1');
            await expect(row.locator('select')).toHaveValue(typeValue);
        } else {
            await expect(row).not.toBeVisible();
        };
    };

    async getUserIdByEmail(email) {
        // Locate the input that has the email value
        const emailInput = this.page.locator(`input[value="${email}"]`);
        // Find the row containing that email input
        const row = this.page.locator('tr').filter({ has: emailInput })
        // Get the ID from the first td in that row
        const idText = await row.locator('td').first().innerText();
        return idText.trim();
    };

    async editUserInTable(id, { name, email, type }) {
        await this.nameInputTable(id).fill(name);
        await this.emailInputTable(id).fill(email);
        await this.selectType(id).selectOption(type);   
        await this.saveButton(id).click();
    };

    async deleteUserInTable(id) {
        await this.deleteButton(id).click();
    };

    async pageContentIsVisible() {
        await expect(this.adminUsersForm).toBeVisible();
        await expect(this.adminUsersTable).toBeVisible();
    }
};