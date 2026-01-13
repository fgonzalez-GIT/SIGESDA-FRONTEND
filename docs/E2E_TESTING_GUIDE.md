# Guía de Tests E2E - Sistema de Cuotas V2

**Versión:** 1.0
**Actualizado:** 10-Enero-2026

---

## Prerequisitos

```bash
# 1. Backend corriendo en puerto 8000
cd ../SIGESDA-BACKEND && npm run dev

# 2. Frontend corriendo en puerto 3003
cd ../SIGESDA-FRONTEND && npm run dev

# 3. Base de datos MySQL/PostgreSQL activa
docker compose up -d db  # o tu setup preferido
```

---

## Comandos Esenciales

```bash
# Ejecutar todos los tests E2E
npm run test:e2e

# Ejecutar con UI interactiva (recomendado para desarrollo)
npm run test:e2e:ui

# Ejecutar solo un archivo específico
npx playwright test e2e/cuotas/generar-cuotas.spec.ts

# Ejecutar solo en chromium
npx playwright test --project=chromium

# Modo debug (pausa en cada paso)
npx playwright test --debug

# Ver reporte HTML de la última ejecución
npx playwright show-report
```

---

## Estructura de Tests

```
e2e/
├── helpers/
│   └── auth.ts                      # Helper loginAsAdmin()
├── ajustes/
│   └── crear-ajuste.spec.ts         # 1 test
├── cuotas/
│   ├── generar-cuotas.spec.ts       # 2 tests
│   ├── recalcular-cuota.spec.ts     # 1 test
│   └── agregar-item-manual.spec.ts  # 2 tests
├── exenciones/
│   └── workflow-exencion.spec.ts    # 1 test
├── auth.setup.ts                    # Setup de autenticación
└── global-setup.ts                  # Ejecuta seed de datos

playwright.config.ts                 # Configuración principal
```

---

## Cómo Funcionan los Tests

### 1. Global Setup (Automático)
Al ejecutar `npm run test:e2e`, se ejecuta automáticamente:
1. `e2e/global-setup.ts` ejecuta seed del backend
2. Crea 52 socios, 4 actividades, ~40 participaciones
3. Datos listos para los tests

### 2. Autenticación
Cada test usa `loginAsAdmin()` en `beforeEach`:
```typescript
test.beforeEach(async ({ page }) => {
  await loginAsAdmin(page);  // Login automático
});
```

### 3. Tests
Tests interactúan con UI real:
- Hacen clic en botones
- Llenan formularios
- Verifican resultados
- Capturan screenshots en fallos

---

## Escribir Nuevos Tests

### Template Básico

```typescript
import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../helpers/auth';

test.describe('Mi Feature', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('debe hacer algo específico', async ({ page }) => {
    // 1. Navegar
    await page.goto('/mi-ruta');

    // 2. Interactuar
    await page.click('button:has-text("Mi Botón")');
    await page.fill('input[name="campo"]', 'valor');

    // 3. Verificar
    await expect(page.locator('text=/Éxito/')).toBeVisible();
  });
});
```

### Best Practices

1. **Usar selectores semánticos:**
   ```typescript
   // ✅ Bueno
   await page.click('button:has-text("Guardar")');
   await page.fill('input[name="email"]', 'test@test.com');

   // ❌ Evitar
   await page.click('.btn-primary-123');
   ```

2. **Agregar timeouts:**
   ```typescript
   await expect(page.locator('h2')).toBeVisible({ timeout: 10000 });
   ```

3. **Esperar carga de red:**
   ```typescript
   await page.waitForLoadState('networkidle');
   ```

---

## Troubleshooting

### Tests fallan por "element not found"

**Causa:** Selectores CSS no coinciden con UI real.

**Solución:**
```bash
# 1. Ejecutar con UI mode para inspeccionar
npm run test:e2e:ui

# 2. Ver screenshot del fallo
ls test-results/*/test-failed-1.png

# 3. Ajustar selectores en el test
```

### Global setup falla

**Causa:** Backend no disponible o base de datos apagada.

**Solución:**
```bash
# 1. Verificar backend corriendo
curl http://localhost:8000/api/health

# 2. Ejecutar seed manualmente
cd ../SIGESDA-BACKEND && npm run db:seed:test

# 3. Verificar logs del seed
```

### Autenticación falla

**Causa:** Helper `loginAsAdmin()` no encuentra formulario de login.

**Solución:**
```typescript
// Verificar que loginAsAdmin() está en beforeEach
test.beforeEach(async ({ page }) => {
  await loginAsAdmin(page);  // ← Debe estar aquí
});
```

### Tests muy lentos

**Causa:** `loginAsAdmin()` ejecuta login en cada test (~2s overhead).

**Solución a corto plazo:**
- Agrupar tests relacionados en mismo archivo
- Usar `test.describe.serial()` para tests secuenciales

**Solución definitiva (recomendada):**
- Migrar a cookies HTTP-only (ver `docs/E2E_STORAGE_STATE_ISSUE.md`)
- Storage state funcionará automáticamente
- 1 solo login por suite completa

---

## Datos de Prueba

Los tests usan datos generados automáticamente:

| Tipo | Cantidad | Detalles |
|------|----------|----------|
| Socios | 52 | ACTIVO: 25, ESTUDIANTE: 15, FAMILIAR: 7, JUBILADO: 3, GENERAL: 2 |
| Actividades | 4 | Guitarra, Piano, Violín, Canto |
| Participaciones | ~40 | Asignadas aleatoriamente |
| Relaciones familiares | 15 | Entre socios |

**Importante:** Los datos se regeneran en cada ejecución. Los IDs pueden cambiar.

---

## Debugging

### Ver paso a paso
```bash
npx playwright test --debug
```

### Ver trace de un test fallido
```bash
npx playwright show-trace test-results/*/trace.zip
```

### Generar código de test automáticamente
```bash
npx playwright codegen http://localhost:3003
```

---

## CI/CD (Futuro)

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3

      # 1. Setup backend con DB
      - name: Start backend
        run: |
          cd SIGESDA-BACKEND
          npm install
          docker compose up -d db
          npm run db:migrate
          npm run dev &

      # 2. Setup frontend
      - name: Start frontend
        run: |
          npm install
          npx playwright install
          npm run dev &

      # 3. Ejecutar tests
      - name: Run E2E tests
        run: npm run test:e2e

      # 4. Upload artifacts
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Referencias

- **Playwright Docs:** https://playwright.dev/docs/intro
- **Storage State Issue:** `docs/E2E_STORAGE_STATE_ISSUE.md`
- **Guía de Desarrollo:** `GUIA_DESARROLLO_FRONTEND.md` (PASO 3)
- **Helper de Auth:** `e2e/helpers/auth.ts`
