// @ts-check
import { test, expect } from '@playwright/test';


test.describe('Statistics', () => {
    test('CT-API-005 - Get library statistics', async ({ request }) => {

        // GET request to the /estatisticas endpoint
        const response = await request.get('/estatisticas');

        // Validate the response status
        expect(response.status()).toBe(200);

        const stats = await response.json();

        // Validate body fields     
        expect(stats).toHaveProperty('totalLivros');
        expect(typeof stats.totalLivros).toBe('number');
        expect(stats.totalLivros).toBeGreaterThanOrEqual(0);

        expect(stats).toHaveProperty('totalPaginas');
        expect(typeof stats.totalPaginas).toBe('number');
        expect(stats.totalPaginas).toBeGreaterThanOrEqual(0);

        expect(stats).toHaveProperty('totalUsuarios');
        expect(typeof stats.totalUsuarios).toBe('number');
        expect(stats.totalUsuarios).toBeGreaterThanOrEqual(0);

        expect(stats).toHaveProperty('livrosDisponiveis');
        expect(typeof stats.livrosDisponiveis).toBe('number');
        expect(stats.livrosDisponiveis).toBeGreaterThanOrEqual(0);

        expect(stats).toHaveProperty('arrendamentosPendentes');
        expect(typeof stats.arrendamentosPendentes).toBe('number');
        expect(stats.arrendamentosPendentes).toBeGreaterThanOrEqual(0);

        expect(stats).toHaveProperty('comprasPendentes');
        expect(typeof stats.comprasPendentes).toBe('number');
        expect(stats.comprasPendentes).toBeGreaterThanOrEqual(0);

        // Validate sum of users by type equals total users
        expect(stats).toHaveProperty('usuariosPorTipo');
        expect(
            stats.usuariosPorTipo.alunos +
            stats.usuariosPorTipo.funcionarios +
            stats.usuariosPorTipo.admins
        ).toBe(stats.totalUsuarios);

        console.log(stats);
    });
});

