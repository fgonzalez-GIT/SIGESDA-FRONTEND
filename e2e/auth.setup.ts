import { test as setup } from '@playwright/test';

const authFile = '.auth/user.json';

setup('authenticate as admin', async ({ page }) => {
  // Navegar a la página de login
  await page.goto('/login');

  // Llenar formulario de login
  await page.fill('input[name="email"]', 'admin@sigesda.com');
  await page.fill('input[name="password"]', 'admin123');

  // Hacer clic en el botón de inicio de sesión
  await page.click('button:has-text("Iniciar Sesión")');

  // Esperar a que la navegación complete y verificar que estamos autenticados
  await page.waitForURL('**/dashboard', { timeout: 10000 });

  // Guardar el estado de autenticación
  await page.context().storageState({ path: authFile });
});
