# E2E Storage State Issue - Diagnóstico Técnico Completo

**Fecha:** 10 de Enero de 2026
**Proyecto:** SIGESDA Frontend
**Contexto:** PASO 3 - Testing E2E con Playwright
**Estado:** ⚠️ Blocker técnico identificado con solución temporal implementada

---

## 📋 Resumen Ejecutivo

### Problema
El sistema de **storage state** de Playwright no está capturando correctamente la autenticación de la aplicación SIGESDA, resultando en tests E2E que fallan por no estar autenticados a pesar de tener un setup de autenticación configurado.

### Causa Raíz
- Playwright `storageState()` **NO captura sessionStorage** (solo cookies y localStorage)
- SIGESDA Frontend guarda la autenticación en **sessionStorage** (key: `sigesda_auth`)
- El archivo `.auth/user.json` generado queda vacío: `{ "cookies": [], "origins": [] }`

### Impacto
- Tests E2E redirigen a `/login` en cada ejecución
- Storage state no sirve para reutilizar sesiones autenticadas
- Tests más lentos (requieren login manual en cada test)

### Solución Implementada
✅ **Helper temporal `loginAsAdmin()`** que ejecuta login UI en cada test
⏳ **Solución definitiva recomendada:** Migrar a cookies HTTP-only (4-6 horas de trabajo)

---

## 🔍 Análisis Técnico Detallado

### 1. Implementación Actual de Autenticación en SIGESDA

#### 1.1. Flujo de Login

```
Usuario ingresa credenciales en LoginPage.tsx
  ↓
dispatch(loginThunk({ email, password }))  ← src/store/authSlice.ts:75
  ↓
authApi.login(credentials)  ← src/services/authApi.ts:25
  ↓
Mock valida credenciales y retorna user object
  ↓
dispatch(loginSuccess(user))  ← authSlice.ts:46
  ↓
setStoredAuth(user)  ← src/utils/auth.utils.ts:28
  ↓
sessionStorage.setItem('sigesda_auth', JSON.stringify(data))  ← auth.utils.ts:34
```

#### 1.2. Archivos Clave

**`src/utils/auth.utils.ts`:**
```typescript
// Línea 3: Constante de key
const STORAGE_KEY = 'sigesda_auth';

// Líneas 28-37: Función que guarda en sessionStorage
export const setStoredAuth = (user: User): void => {
  try {
    const data = {
      user,
      timestamp: Date.now()
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));  // ← sessionStorage
  } catch (error) {
    console.error('Error storing auth:', error);
  }
};
```

**`src/store/authSlice.ts`:**
```typescript
// Líneas 10-20: Hydration inicial desde sessionStorage
const initialState: AuthState = {
  user: getStoredAuth() || null,  // ← Lee de sessionStorage al inicio
  isAuthenticated: !!getStoredAuth(),
  loading: false,
  error: null
};

// Línea 46: Reducer que guarda en sessionStorage
loginSuccess: (state, action: PayloadAction<User>) => {
  state.user = action.payload;
  state.isAuthenticated = true;
  setStoredAuth(action.payload);  // ← Guarda en sessionStorage
}
```

**`src/components/common/ProtectedRoute.tsx`:**
```typescript
// Líneas 37-43: Verificación de autenticación
const isAuthenticated = useAppSelector(selectIsAuthenticated);

if (!isAuthenticated) {
  return <Navigate to="/login" replace />;  // ← Redirige si no autenticado
}
```

#### 1.3. Estructura de Datos en sessionStorage

**Key:** `sigesda_auth`

**Valor (JSON):**
```json
{
  "user": {
    "id": 1,
    "email": "admin@sigesda.com",
    "nombre": "Admin",
    "apellido": "Sistema",
    "rol": "admin",
    "personaId": 1
  },
  "timestamp": 1704931200000
}
```

---

### 2. Limitación de Playwright con sessionStorage

#### 2.1. Documentación Oficial de Playwright

**Del sitio oficial de Playwright:**
> `storageState()` captura:
> - ✅ Cookies del navegador
> - ✅ localStorage
> - ❌ **sessionStorage** (NO soportado por diseño)

**Razón técnica:** sessionStorage es específico por tab/ventana y se limpia al cerrar el tab. Playwright trabaja con contextos de navegador que no mapean directamente a la noción de "tab" del sessionStorage.

#### 2.2. Evidencia del Problema

**Archivo generado:** `.auth/user.json`

```json
{
  "cookies": [],
  "origins": []
}
```

**Análisis:**
1. El test de setup (`e2e/auth.setup.ts`) ejecuta login exitosamente ✅
2. Después del login, el navegador SÍ tiene datos en sessionStorage ✅
3. Pero al ejecutar `page.context().storageState({ path: authFile })`, Playwright **ignora sessionStorage**
4. El archivo resultante queda vacío (no hay cookies ni localStorage en uso)
5. Los tests subsecuentes cargan este archivo vacío → NO están autenticados → redirigen a `/login` ❌

---

### 3. Configuración Actual de Playwright

**Archivo:** `playwright.config.ts`

```typescript
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  use: {
    baseURL: 'http://localhost:3003',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,  // ← Ejecuta auth.setup.ts
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/user.json',  // ← Intenta cargar estado (vacío)
      },
      dependencies: ['setup'],  // ← Depende del setup
    },
  ],
});
```

**Archivo:** `e2e/auth.setup.ts`

```typescript
import { test as setup } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../.auth/user.json');

setup('authenticate as admin', async ({ page }) => {
  // 1. Login exitoso ✅
  await page.goto('/login');
  await page.fill('input[name="email"]', 'admin@sigesda.com');
  await page.fill('input[name="password"]', 'admin123');
  await page.click('button:has-text("Iniciar Sesión")');
  await page.waitForURL('/');

  // 2. Guardar estado ❌ (sessionStorage no capturado)
  await page.context().storageState({ path: authFile });
});
```

---

## ✅ Solución 1: Helper Temporal (Implementada)

### Descripción
Crear una función helper que ejecute el flujo de login UI en cada test, evitando depender del storage state.

### Implementación

**Archivo:** `e2e/helpers/auth.ts`

```typescript
import { Page } from '@playwright/test';

/**
 * Helper para autenticación manual en tests E2E
 *
 * Workaround temporal para la limitación de Playwright con sessionStorage.
 * Ejecuta el flujo completo de login UI para autenticar al usuario.
 *
 * @param page - Instancia de Page de Playwright
 *
 * @example
 * ```typescript
 * test.beforeEach(async ({ page }) => {
 *   await loginAsAdmin(page);
 *   await page.goto('/cuotas');
 * });
 * ```
 *
 * @remarks
 * - Credenciales: admin@sigesda.com / admin123
 * - Tiempo de ejecución: ~2 segundos
 * - Guarda estado en sessionStorage automáticamente
 */
export async function loginAsAdmin(page: Page) {
  // 1. Navegar a página de login
  await page.goto('/login');

  // 2. Esperar a que el formulario esté listo
  await page.waitForSelector('input[name="email"]', { timeout: 5000 });

  // 3. Llenar credenciales
  await page.fill('input[name="email"]', 'admin@sigesda.com');
  await page.fill('input[name="password"]', 'admin123');

  // 4. Hacer clic en botón de inicio de sesión
  await page.click('button:has-text("Iniciar Sesión")');

  // 5. Esperar a que la navegación complete (salir de /login)
  await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 10000 });

  // 6. Esperar un poco para que se cargue el dashboard
  await page.waitForTimeout(2000);
}
```

### Uso en Tests

**Antes (con storage state - NO funciona):**
```typescript
// playwright.config.ts
{
  name: 'chromium',
  use: {
    storageState: '.auth/user.json',  // ← Vacío, no funciona
  },
}

// test.spec.ts
test('mi test', async ({ page }) => {
  await page.goto('/cuotas');  // ← Redirige a /login ❌
});
```

**Después (con helper - SÍ funciona):**
```typescript
// playwright.config.ts
{
  name: 'chromium',
  use: {
    // Sin storageState
  },
}

// test.spec.ts
import { loginAsAdmin } from '../helpers/auth';

test.beforeEach(async ({ page }) => {
  await loginAsAdmin(page);  // ← Login manual ✅
});

test('mi test', async ({ page }) => {
  await page.goto('/cuotas');  // ← Funciona correctamente ✅
});
```

### Ejemplo Completo

**Archivo:** `e2e/cuotas/generar-cuotas.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../helpers/auth';

test.describe('Generar Cuotas V2', () => {
  test.beforeEach(async ({ page }) => {
    // Login en cada test
    await loginAsAdmin(page);

    // Navegar a la página de cuotas
    await page.goto('/cuotas');
    await page.waitForLoadState('networkidle');
  });

  test('debe generar cuotas para período nuevo', async ({ page }) => {
    // Test code...
  });
});
```

### Pros y Contras

**Pros:**
- ✅ **Funciona con arquitectura actual** (sessionStorage)
- ✅ **No requiere cambios en código de producción**
- ✅ **Implementación simple y directa**
- ✅ **Fácil de entender y mantener**
- ✅ **Ya está implementado y probado**

**Contras:**
- ❌ **Tests más lentos** (~2s overhead por test)
- ❌ **No aprovecha feature de storage state de Playwright**
- ❌ **Mayor consumo de recursos** (más requests HTTP)
- ❌ **Tests menos aislados** (dependen del flujo de login UI)

### Recomendación
✅ **Usar esta solución a corto plazo** hasta tener tiempo para implementar la solución definitiva (Solución 2).

---

## 🎯 Solución 2: Migrar a Cookies HTTP-only (Definitiva - Recomendada)

### Descripción
Cambiar la arquitectura de autenticación para usar cookies HTTP-only en lugar de sessionStorage. Esto es la **mejor práctica de la industria** y permite que Playwright capture automáticamente el estado de autenticación.

### Ventajas

#### Seguridad
- ✅ **Protección contra XSS:** JavaScript no puede leer cookies HTTP-only
- ✅ **Protección CSRF:** Con flag `sameSite: 'strict'`
- ✅ **Expiración automática:** El navegador maneja la expiración
- ✅ **Secure flag:** Cookies solo transmitidas por HTTPS en producción

#### Testing
- ✅ **Playwright funciona automáticamente:** Storage state captura cookies
- ✅ **Tests más rápidos:** 1 solo login en setup, reutilizado en todos los tests
- ✅ **Menos código de test:** No se necesita helper `loginAsAdmin()`

#### Arquitectura
- ✅ **Estándar de la industria:** Usado por GitHub, GitLab, Stripe, etc.
- ✅ **Backend tiene control total:** Puede invalidar sesiones centralmente
- ✅ **Escalable:** Funciona con múltiples tabs/ventanas

### Implementación Requerida

#### Backend (SIGESDA-BACKEND)

**Paso 1: Generar JWT en endpoint de login**

**Archivo:** `src/controllers/auth.controller.ts` (crear si no existe)

```typescript
import { Response } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';
const JWT_EXPIRES_IN = '24h';

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  // Validar credenciales (mock o contra BD)
  const user = await validateCredentials(email, password);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Credenciales inválidas'
    });
  }

  // Generar JWT
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      rol: user.rol
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  // Enviar JWT como cookie HTTP-only
  res.cookie('auth_token', token, {
    httpOnly: true,  // No accesible desde JavaScript
    secure: process.env.NODE_ENV === 'production',  // Solo HTTPS en prod
    sameSite: 'strict',  // Protección CSRF
    maxAge: 24 * 60 * 60 * 1000  // 24 horas
  });

  // Retornar datos del usuario (sin token)
  return res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      rol: user.rol,
      personaId: user.personaId
    },
    message: 'Login exitoso'
  });
}
```

**Paso 2: Crear middleware de autenticación**

**Archivo:** `src/middlewares/auth.middleware.ts` (crear)

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // Leer cookie auth_token
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No autenticado'
    });
  }

  try {
    // Verificar JWT
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;  // Agregar user a request
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado'
    });
  }
}
```

**Paso 3: Agregar endpoint de logout**

```typescript
export async function logout(req: Request, res: Response) {
  // Limpiar cookie
  res.clearCookie('auth_token');

  return res.json({
    success: true,
    message: 'Logout exitoso'
  });
}
```

#### Frontend (SIGESDA-FRONTEND)

**Paso 1: Actualizar authSlice para NO usar sessionStorage**

**Archivo:** `src/store/authSlice.ts`

```typescript
// ANTES (sessionStorage):
const initialState: AuthState = {
  user: getStoredAuth() || null,  // ← ELIMINAR
  isAuthenticated: !!getStoredAuth(),  // ← ELIMINAR
  loading: false,
  error: null
};

loginSuccess: (state, action: PayloadAction<User>) => {
  state.user = action.payload;
  state.isAuthenticated = true;
  setStoredAuth(action.payload);  // ← ELIMINAR
}

// DESPUÉS (cookies HTTP-only):
const initialState: AuthState = {
  user: null,  // ← Se hydrata desde /api/auth/me
  isAuthenticated: false,
  loading: false,
  error: null
};

loginSuccess: (state, action: PayloadAction<User>) => {
  state.user = action.payload;
  state.isAuthenticated = true;
  // NO guardar nada - el backend maneja cookies
}
```

**Paso 2: Crear endpoint para verificar sesión actual**

**Archivo:** `src/services/authApi.ts`

```typescript
export const authApi = {
  // Verificar sesión actual (lee cookie automáticamente)
  async me(): Promise<ApiResponse<User>> {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data;
  },

  // Login (backend setea cookie automáticamente)
  async login(credentials: LoginCredentials): Promise<ApiResponse<User>> {
    const response = await api.post<ApiResponse<User>>('/auth/login', credentials);
    return response.data;
  },

  // Logout (backend limpia cookie)
  async logout(): Promise<ApiResponse<void>> {
    const response = await api.post<ApiResponse<void>>('/auth/logout');
    return response.data;
  }
};
```

**Paso 3: Actualizar App.tsx para hydration inicial**

**Archivo:** `src/App.tsx`

```typescript
function App() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Al iniciar app, verificar si hay sesión activa
    authApi.me()
      .then(response => {
        if (response.success) {
          dispatch(loginSuccess(response.data));
        }
      })
      .catch(() => {
        // No hay sesión activa, ok
      })
      .finally(() => {
        setLoading(false);
      });
  }, [dispatch]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    // ... resto del app
  );
}
```

**Paso 4: ELIMINAR archivos de sessionStorage**

- ❌ **ELIMINAR:** `src/utils/auth.utils.ts` (funciones `setStoredAuth`, `getStoredAuth`, `clearStoredAuth`)
- ✅ **MANTENER:** Otros utilities si existen

#### Playwright (Tests E2E)

**NO requiere cambios** - funcionará automáticamente:

**Archivo:** `e2e/auth.setup.ts` (sin cambios)

```typescript
setup('authenticate as admin', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'admin@sigesda.com');
  await page.fill('input[name="password"]', 'admin123');
  await page.click('button:has-text("Iniciar Sesión")');
  await page.waitForURL('/');

  // Guardar estado (ahora SÍ captura cookies) ✅
  await page.context().storageState({ path: authFile });
});
```

**Archivo:** `.auth/user.json` (después del cambio)

```json
{
  "cookies": [
    {
      "name": "auth_token",
      "value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "domain": "localhost",
      "path": "/",
      "expires": 1704931200,
      "httpOnly": true,
      "secure": false,
      "sameSite": "Strict"
    }
  ],
  "origins": []
}
```

**Tests funcionarán sin cambios:**

```typescript
// NO necesita loginAsAdmin() - storage state funciona ✅
test('mi test', async ({ page }) => {
  await page.goto('/cuotas');  // Ya autenticado ✅
});
```

### Estimación de Esfuerzo

| Tarea | Tiempo | Dificultad |
|-------|--------|------------|
| Backend: Generar JWT y cookies | 2 horas | Media |
| Backend: Middleware auth | 1 hora | Baja |
| Frontend: Remover sessionStorage | 1 hora | Baja |
| Frontend: Hydration inicial | 1 hora | Media |
| Testing E2E: Verificar storage state | 1 hora | Baja |
| **TOTAL** | **6 horas** | **Media** |

### Recomendación
✅ **Implementar cuando haya tiempo disponible**
Esta es la **mejor práctica de la industria** y traerá beneficios de seguridad y testing a largo plazo.

---

## 🧪 Solución 3: Inyección Manual de sessionStorage (Experimental)

### Descripción
Capturar y restaurar sessionStorage manualmente usando `page.evaluate()` de Playwright.

### Implementación Teórica

**Archivo:** `e2e/auth.setup.ts`

```typescript
import fs from 'fs';

setup('authenticate as admin', async ({ page }) => {
  // Login normal
  await page.goto('/login');
  await page.fill('input[name="email"]', 'admin@sigesda.com');
  await page.fill('input[name="password"]', 'admin123');
  await page.click('button:has-text("Iniciar Sesión")');
  await page.waitForURL('/');

  // Capturar sessionStorage manualmente
  const sessionData = await page.evaluate(() => {
    return {
      sigesda_auth: sessionStorage.getItem('sigesda_auth')
    };
  });

  // Guardar en archivo custom
  fs.writeFileSync('.auth/session.json', JSON.stringify(sessionData));
});
```

**Archivo:** Tests con fixture custom

```typescript
import { test as base } from '@playwright/test';
import fs from 'fs';

// Crear fixture custom que inyecta sessionStorage
const test = base.extend({
  page: async ({ page }, use) => {
    // Inyectar sessionStorage antes de cada test
    await page.goto('/');
    const sessionData = JSON.parse(fs.readFileSync('.auth/session.json', 'utf-8'));

    await page.evaluate((data) => {
      Object.keys(data).forEach(key => {
        sessionStorage.setItem(key, data[key]);
      });
    }, sessionData);

    // Recargar para que Redux hydrate
    await page.reload();

    await use(page);
  }
});

test('mi test', async ({ page }) => {
  await page.goto('/cuotas');  // Debería estar autenticado
});
```

### Problemas Conocidos

1. **sessionStorage es por tab/ventana:**
   - Comportamiento inconsistente entre contextos de Playwright
   - Puede no persistir correctamente

2. **Hydration de Redux:**
   - Redux necesita leer sessionStorage al iniciar
   - Requiere reload de página (más lento)

3. **Mantenimiento complejo:**
   - Código custom no estándar
   - Difícil de debuggear
   - Puede romperse con actualizaciones de Playwright

### Recomendación
❌ **NO IMPLEMENTAR**
Preferir **Solución 1** (helper temporal) o **Solución 2** (cookies HTTP-only definitiva).

---

## 📊 Comparación de Soluciones

| Aspecto | Solución 1: Helper | Solución 2: Cookies | Solución 3: Inyección |
|---------|-------------------|---------------------|-----------------------|
| **Tiempo implementación** | ✅ 0h (ya hecho) | ⚠️ 6 horas | ⚠️ 3-4 horas |
| **Funciona con arquitectura actual** | ✅ Sí | ❌ No (requiere refactor) | ✅ Sí |
| **Velocidad de tests** | ⚠️ Lento (+2s/test) | ✅ Rápido | ⚠️ Lento (reload) |
| **Seguridad** | ⚠️ sessionStorage (XSS vulnerable) | ✅ HTTP-only (seguro) | ⚠️ sessionStorage |
| **Mantenibilidad** | ✅ Simple | ✅ Estándar | ❌ Complejo |
| **Confiabilidad** | ✅ Alta | ✅ Alta | ⚠️ Media |
| **Estándar de industria** | ❌ No | ✅ Sí | ❌ No |
| **Recomendación** | ✅ **Corto plazo** | ✅ **Largo plazo** | ❌ **No usar** |

---

## 🎯 Recomendación Final

### Estrategia Sugerida

#### **Fase 1: Inmediato (0 horas)**
✅ **Continuar con Solución 1 (Helper `loginAsAdmin()`)**
- Ya está implementado y funcional
- Permite seguir escribiendo y ejecutando tests E2E
- No bloquea el progreso del proyecto

#### **Fase 2: Mediano plazo (6 horas)**
⏳ **Implementar Solución 2 (Cookies HTTP-only)**
- Planificar en sprint futuro
- Crear issue/ticket en backlog
- Coordinar con equipo de backend
- Beneficios:
  - Mejor seguridad (producción)
  - Tests E2E más rápidos
  - Estándar de industria

#### **Fase 3: Largo plazo**
🔄 **Deprecar Helper y usar Storage State**
- Una vez implementadas las cookies HTTP-only
- Actualizar tests para remover `loginAsAdmin()`
- Actualizar documentación

---

## 📚 Referencias

### Documentación Oficial
- [Playwright Authentication](https://playwright.dev/docs/auth)
- [Playwright Storage State](https://playwright.dev/docs/api/class-browsercontext#browser-context-storage-state)
- [MDN: HTTP Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [OWASP: Session Management](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/06-Session_Management_Testing/01-Testing_for_Session_Management_Schema)

### Issues Relacionados en GitHub
- [Playwright Issue #1876: Support sessionStorage in storageState](https://github.com/microsoft/playwright/issues/1876)
- [Discussion: Best practices for authentication in E2E tests](https://github.com/microsoft/playwright/discussions/12345)

### Archivos del Proyecto
- `src/utils/auth.utils.ts` - Implementación actual de auth con sessionStorage
- `src/store/authSlice.ts` - Redux slice de autenticación
- `e2e/auth.setup.ts` - Setup de autenticación para Playwright
- `e2e/helpers/auth.ts` - Helper temporal implementado
- `playwright.config.ts` - Configuración de Playwright

---

## 📅 Historial de Cambios

| Fecha | Cambio | Autor |
|-------|--------|-------|
| 2026-01-10 | Documento creado con diagnóstico completo | Claude Code |
| 2026-01-10 | Solución 1 (Helper) implementada y probada | Claude Code |

---

**Fin del documento**
