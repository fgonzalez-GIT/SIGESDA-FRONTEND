import { Page } from '@playwright/test';

export async function loginAsAdmin(page: Page) {
  // Navegar a la página de login
  await page.goto('/login');

  // Verificar que estamos en la página de login
  await page.waitForSelector('input[name="email"]', { timeout: 5000 });

  // Llenar formulario de login
  await page.fill('input[name="email"]', 'admin@sigesda.com');
  await page.fill('input[name="password"]', 'admin123');

  // Hacer clic en el botón de inicio de sesión
  await page.click('button:has-text("Iniciar Sesión")');

  // Esperar a que la navegación complete (salir de /login)
  await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 10000 });

  // Esperar un poco para que se cargue el dashboard
  await page.waitForTimeout(2000);
}
