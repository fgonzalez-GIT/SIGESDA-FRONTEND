import { test as setup, expect } from '@playwright/test';

const authFile = '.auth/user.json';

setup('authenticate as admin', async ({ page }) => {
  // Navegar a la página de login
  await page.goto('/login');

  // Llenar formulario de login
  await page.fill('input[name="email"]', 'admin@sigesda.com');
  await page.fill('input[name="password"]', 'admin123');

  // Hacer clic en el botón de inicio de sesión
  await page.click('button:has-text("Iniciar Sesión")');

  // Esperar a que desaparezca el formulario de login (señal de éxito)
  await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 10000 });

  // Esperar un poco más para que se guarden cookies/localStorage
  await page.waitForTimeout(2000);

  // Verificar que hay un elemento que solo aparece cuando estamos autenticados
  // (por ejemplo, el header o sidebar del dashboard)
  await expect(page.locator('header, nav')).toBeVisible({ timeout: 5000 });

  // Guardar el estado de autenticación (incluye cookies y localStorage)
  await page.context().storageState({ path: authFile });
});
