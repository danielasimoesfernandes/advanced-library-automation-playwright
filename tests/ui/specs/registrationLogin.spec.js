////////////////////////////////////////
/////// 1. REGISTRATION & LOGIN ////////
////////////////////////////////////////

// @ts-check
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { RegistrationPage } from '../pages/RegistrationPage';
import { DashboardPage } from '../pages/dashboardPage';


test.describe('Login and Registration Tests', () => {
    test('CT-FE-001 - Complete studente registration flow', async ({ page }) => {

        const loginPage = new LoginPage(page);
        const registrationPage = new RegistrationPage(page);

        const student = {
            name: 'Carlos Oliveira',
            email: `carlos${Date.now()}@teste.com`,
            password: 'senha123',
            confirmPassword: 'senha123'
        };

        await loginPage.goToWebsite();
        await loginPage.verifyLoginPage(); // Verify page name 
        await loginPage.goToRegisterPage();
        await registrationPage.verifyRegisterPage(); // Verify page name 

        // Accept dialog 
        page.once('dialog', async dialog => {
            console.log("Dialog appeared with message:", dialog.message());
            expect(dialog.message()).toBe('Cadastro realizado com sucesso! Faça login.');
            await dialog.accept();
        });

        // Submit register form
        await registrationPage.registerNewUser(student);

        // Redirect to login page 
        await page.waitForURL(/login\.html$/, { timeout: 30000 });
        await loginPage.verifyLoginPage();

        // Validate that register form is empty 
        await loginPage.goToRegisterPage();
        await expect(registrationPage.name).toHaveValue('');
        await expect(registrationPage.email).toHaveValue('');
        await expect(registrationPage.password).toHaveValue('');
        await expect(registrationPage.confirmPassword).toHaveValue('');

        // Clear locaStorage to avoid interference with other tests
        await page.evaluate(() => {
            localStorage.clear();
        });
    });

    test('CT-FE-002 - Validation of Non-Matching Passwords', async ({ page }) => {

        const loginPage = new LoginPage(page);
        const registrationPage = new RegistrationPage(page);

        const student = {
            name: 'Dani Teste',
            email: `dani${Date.now()}@teste.com`,
            password: 'senha123',
            confirmPassword: 'senha321'
        };

        await loginPage.goToWebsite();
        await loginPage.goToRegisterPage();
        await registrationPage.verifyRegisterPage();

        // Accept dialog 
        await Promise.all([
            page.waitForEvent('dialog').then(async dialog => {
                console.log('Dialog:', dialog.message());
                expect(dialog.message()).toBe('As senhas não conferem.');
                await dialog.accept();
            }),
            // Register student user
            await registrationPage.registerNewUser(student)
        ]);

        await registrationPage.verifyRegisterPage();

        // Clear locaStorage to avoid interference with other tests
        await page.evaluate(() => {
            localStorage.clear();
        });

    });

    test('CT-FE-003 - Log in with Admin user', async ({ page }) => {

        const loginPage = new LoginPage(page);
        const dashboardPage = new DashboardPage(page);

        await loginPage.goToWebsite();
        await loginPage.verifyLoginPage();

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

        // Verify page title
        await dashboardPage.verifyDashboardTitle();

        // Get logged user from localStorage
        // @ts-ignore
        const loggedUser = await page.evaluate(() => JSON.parse(localStorage.getItem('usuario')));
        console.log("Logged user:", loggedUser);

        // Username visible in header
        expect(await dashboardPage.usernameDisplayed());
        expect(await dashboardPage.getUsername()).toContain(loggedUser.nome);

        // Validate localStorage object
        await dashboardPage.verifyUserInLocalStorage(
            loggedUser.email,
            loggedUser.id,
            loggedUser.nome,
            loggedUser.tipo
        );
        await page.evaluate(() => localStorage.clear());

        // Clear locaStorage to avoid interference with other tests
        await page.evaluate(() => {
            localStorage.clear();
        });
    });


    test('CT-FE-004 - Log in with invalid credentials', async ({ page }) => {

        const loginPage = new LoginPage(page);

        const user = {
            email: "admin@biblioteca.com",
            password: "wrongpassword"
        };

        await loginPage.goToWebsite();

        // Accept dialog 
        await Promise.all([
            page.waitForEvent('dialog').then(async dialog => {
                console.log('Dialog:', dialog.message());
                expect(dialog.message()).toBe('Email ou senha incorretos');
                await dialog.accept();
            }),
            //Login user
            await loginPage.logIn(user)
        ]);

        await loginPage.verifyLoginPage();

        // Clear locaStorage to avoid interference with other tests
        await page.evaluate(() => {
            localStorage.clear();
        });
    });

    // EXTRA TESTS
    test.skip('Log in with Student user', async ({ page }) => {

        const loginPage = new LoginPage(page);
        const dashboardPage = new DashboardPage(page);

        await loginPage.goToWebsite();
        await loginPage.verifyLoginPage();

        // Accept dialog 
        await Promise.all([
            page.waitForEvent('dialog').then(async dialog => {
                console.log('Dialog:', dialog.message());
                expect(dialog.message()).toBe('Login realizado com sucesso!');
                await dialog.accept();
            }),
            // Log in with admin user
            await loginPage.logInStudentUser()
        ]);

        // Verify page title
        await dashboardPage.verifyDashboardTitle();

        // Get logged user from localStorage
        // @ts-ignore
        const loggedUser = await page.evaluate(() => JSON.parse(localStorage.getItem('usuario')));
        console.log("Logged user:", loggedUser);

        // Username visible in header
        expect(await dashboardPage.usernameDisplayed());
        expect(await dashboardPage.getUsername()).toContain(loggedUser.nome);

        // Validate localStorage object
        await dashboardPage.verifyUserInLocalStorage(
            loggedUser.email,
            loggedUser.id,
            loggedUser.nome,
            loggedUser.tipo
        );

        // Clear locaStorage to avoid interference with other tests
        await page.evaluate(() => {
            localStorage.clear();
        });
    });

    test.skip('Log in with Employee user', async ({ page }) => {

        const loginPage = new LoginPage(page);
        const dashboardPage = new DashboardPage(page);

        await loginPage.goToWebsite();
        await loginPage.verifyLoginPage();

        // Accept dialog 
        await Promise.all([
            page.waitForEvent('dialog').then(async dialog => {
                console.log('Dialog:', dialog.message());
                expect(dialog.message()).toBe('Login realizado com sucesso!');
                await dialog.accept();
            }),
            // Log in with admin user
            await loginPage.logInEmployeeUser()
        ]);

        // Verify page title
        await dashboardPage.verifyDashboardTitle();

        // Get logged user from localStorage
        // @ts-ignore
        const loggedUser = await page.evaluate(() => JSON.parse(localStorage.getItem('usuario')));
        console.log("Logged user:", loggedUser);

        // Username visible in header
        expect(await dashboardPage.usernameDisplayed());
        expect(await dashboardPage.getUsername()).toContain(loggedUser.nome);

        // Validate localStorage object
        await dashboardPage.verifyUserInLocalStorage(
            loggedUser.email,
            loggedUser.id,
            loggedUser.nome,
            loggedUser.tipo
        );

        // Clear locaStorage to avoid interference with other tests
        await page.evaluate(() => {
            localStorage.clear();
        });
    });

    test.skip('Register and log in with personal user', async ({ page }) => {

        const loginPage = new LoginPage(page);
        const registrationPage = new RegistrationPage(page);

        await loginPage.goToWebsite();
        await loginPage.verifyLoginPage(); // Verify page name
        await loginPage.goToRegisterPage();
        await registrationPage.verifyRegisterPage(); // Verify page name

        // Accept dialog 
        page.once('dialog', async dialog => {
            console.log("Dialog appeared with message:", dialog.message());
            expect(dialog.message()).toBe('Cadastro realizado com sucesso! Faça login.');
            await dialog.accept();
        })
        await registrationPage.registerPersonalUser()

        // Redirect to login page
        await page.waitForURL(/login\.html$/, { timeout: 30000 });
        await loginPage.verifyLoginPage();

        // Accept dialog and log in
        await Promise.all([
            page.waitForEvent('dialog').then(async dialog => {
                console.log('Dialog:', dialog.message());
                expect(dialog.message()).toBe('Login realizado com sucesso!');
                await dialog.accept();
            }),
            await loginPage.logInPersonalUser()
        ]);

        // Clear locaStorage to avoid interference with other tests
        await page.evaluate(() => {
            localStorage.clear();
        });
    });
});
