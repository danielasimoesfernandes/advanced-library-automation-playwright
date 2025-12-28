////////////////////////////////////////
/////////// 8. ADMIN USERS /////////////
////////////////////////////////////////

// @ts-check
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/dashboardPage';
import { AdminUsersPage } from '../pages/adminUsersPage';
import id from 'faker/lib/locales/id_ID';


test.describe('Admin Users Management', () => {
    test('CT-FE-020 - Access Users menu (Admin)', async ({ page, request }) => {

        const loginPage = new LoginPage(page);
        const dashboardPage = new DashboardPage(page);
        const adminUsersPage = new AdminUsersPage(page);

        //Open login page
        await loginPage.goToWebsite();

        // Log in with student user to verify access is blocked
        /// Accept dialog 
        await Promise.all([
            page.waitForEvent('dialog').then(async dialog => {
                console.log('Dialog:', dialog.message());
                expect(dialog.message()).toBe('Login realizado com sucesso!');
                await dialog.accept();
            }),
            // Log in with admin user 
            await loginPage.logInStudentUser()
        ]);

        // Try to access URL from Users Admin menu without admin login
        await page.goto('http://localhost:3000/admin-usuarios.html');

        const adminBlockedArea = page.locator('#area-admin-bloqueio');
        await expect(adminBlockedArea).toBeVisible();
        await expect(adminBlockedArea).toContainText('Somente administradores podem acessar esta página.');
        console.log('Access to Admin Users menu blocked for non-admin user as expected.');

        //Open login page again
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

        //Access Admin Users menu 
        await dashboardPage.clickOnMenu(dashboardPage.usersMenuButton);
        await adminUsersPage.verifyAdminUsersTitle();

        //Verify page content is visible
        await adminUsersPage.pageContentIsVisible();
        console.log('All content in Admin Users page is visible as expected.');

    });

    test('CT-FE-021 - Create new employee user (Admin UI) ', async ({ page, request }) => {

        const loginPage = new LoginPage(page);
        const dashboardPage = new DashboardPage(page);
        const adminUsersPage = new AdminUsersPage(page);

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

        //Access Admin Users menu 
        await dashboardPage.clickOnMenu(dashboardPage.usersMenuButton);
        await adminUsersPage.verifyAdminUsersTitle();

        let newUser;

        /// Accept dialog 
        await Promise.all([
            page.waitForEvent('dialog').then(async dialog => {
                console.log('Dialog:', dialog.message());
                expect(dialog.message()).toBe('Usuário criado com sucesso!');
                await dialog.accept();
            }),
            //Register new user - Employee
            newUser = await adminUsersPage.registerNewUser('Funcionário')
        ]);

        console.log('New Employee: ' + newUser.fullName);
        const userID = await adminUsersPage.getUserIdByEmail(newUser.emailComplete);
        console.log('New Employee ID: ' + userID);
        // Verify new user is in users table
        await page.reload();
        await adminUsersPage.verifyUsersDataInTable(newUser.fullName, newUser.emailComplete, 'Funcionário', userID);
    });

    test('CT-FE-022 - Edit user from the table (Admin UI) ', async ({ page, request }) => {

        const loginPage = new LoginPage(page);
        const dashboardPage = new DashboardPage(page);
        const adminUsersPage = new AdminUsersPage(page);

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

        //Access Admin Users menu 
        await dashboardPage.clickOnMenu(dashboardPage.usersMenuButton);
        await adminUsersPage.verifyAdminUsersTitle();

        let newUser;

        /// Accept dialog 
        await Promise.all([
            page.waitForEvent('dialog').then(async dialog => {
                console.log('Dialog:', dialog.message());
                expect(dialog.message()).toBe('Usuário criado com sucesso!');
                await dialog.accept();
            }),
            //Register new user - Employee
            newUser = await adminUsersPage.registerNewUser('Funcionário')
        ]);

        await page.reload();
        const userId = await adminUsersPage.getUserIdByEmail(newUser.emailComplete);
        console.log('New Employee: ' + newUser.fullName + ' | ID: ' + userId + ' Type: Funcionário');

        // Verify new user is in users table
        await page.reload();
        await adminUsersPage.verifyUsersDataInTable(newUser.fullName, newUser.emailComplete, 'Funcionário', userId);

        // New data to edit user
        const editedUser = adminUsersPage.generateRandomUserDate(true);
        console.log('Edited Employee Data: ' + editedUser.fullName + ' | ' + editedUser.emailComplete + ' | Type: Administrador');
        // Verify new user is in users table
        await page.reload();
        // '3' for Administrador, '2' for Funcionário, '1' for Aluno
        await adminUsersPage.editUserInTable(userId, { name: editedUser.fullName, email: editedUser.emailComplete, type: '3' }); 
        // Verify new user is in users table
        await page.reload();
        await adminUsersPage.verifyUsersDataInTable(editedUser.fullName, editedUser.emailComplete, 'Administrador', userId);
    });

     test('CT-FE-023 - Remove user from the table (Admin UI) ', async ({ page, request }) => {

        const loginPage = new LoginPage(page);
        const dashboardPage = new DashboardPage(page);
        const adminUsersPage = new AdminUsersPage(page);

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

        //Access Admin Users menu 
        await dashboardPage.clickOnMenu(dashboardPage.usersMenuButton);
        await adminUsersPage.verifyAdminUsersTitle();

        let newUser;

        /// Accept dialog 
        await Promise.all([
            page.waitForEvent('dialog').then(async dialog => {
                console.log('Dialog:', dialog.message());
                expect(dialog.message()).toBe('Usuário criado com sucesso!');
                await dialog.accept();
            }),
            //Register new user - Employee
            newUser = await adminUsersPage.registerNewUser('Funcionário')
        ]);

        await page.reload();
        const userId = await adminUsersPage.getUserIdByEmail(newUser.emailComplete);
        console.log('New Employee: ' + newUser.fullName + ' | ID: ' + userId + ' Type: Funcionário');

        // Verify new user is in users table
        await page.reload();
        await adminUsersPage.verifyUsersDataInTable(newUser.fullName, newUser.emailComplete, 'Funcionário', userId);

        // Remove user
        /// Accept dialog 
        await Promise.all([
            page.waitForEvent('dialog').then(async dialog => {
                console.log('Dialog:', dialog.message());
                expect(dialog.message()).toBe('Deseja realmente excluir o usuário #' + userId + '?');
                await dialog.accept();
            }),
            // Remove user from table
            await adminUsersPage.deleteUserInTable(userId)
        ]);

        // Verify user is removed from users table
        await page.reload();
        
        await adminUsersPage.verifyUsersDataInTable(newUser.fullName, newUser.emailComplete, 'Administrador', userId, false);
        console.log('User ' + newUser.fullName + ' successfully removed from users table.');
    });
});
