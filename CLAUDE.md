# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SIGESDA Frontend is a React + TypeScript application for managing a club/association system (SIGESDA - Sistema de Gestión de Actividades). It handles personas (people), actividades (activities), reservations, payments, and administrative catalogs.

**Stack:**
- React 18 + TypeScript (Vite)
- Material-UI (MUI) v7
- Redux Toolkit for state management
- React Router v7 for routing
- Zod v4 for validation schemas
- Axios for API calls
- React Hook Form for forms

## Development Commands

### Starting Development
```bash
npm run dev          # Start dev server on port 3003
```

### Building
```bash
npm run build        # TypeScript compile + Vite build
npm run preview      # Preview production build
```

### Linting
```bash
npm run lint         # ESLint check (TypeScript + TSX files)
```

### Testing
The project has test files in `__tests__/` directories within schemas, types, and services folders, but no test runner script is currently configured in package.json.

## Architecture

### Key Architectural Patterns

**1. Multi-tier Architecture**
- **Pages** (`src/pages/`) - Route-level components with business logic
- **Components** (`src/components/`) - Reusable UI organized by domain
- **Services** (`src/services/`) - API communication layer
- **Store** (`src/store/`) - Redux state management with slices
- **Schemas** (`src/schemas/`) - Zod validation schemas
- **Types** (`src/types/`) - TypeScript type definitions

**2. API Integration**
- Base API client in `src/services/api.ts` with axios interceptors for logging
- API proxy configured: `/api/*` proxies to `http://localhost:8000` (backend)
- Default API URL: `http://localhost:8000/api` (configurable via `VITE_API_URL`)
- All API responses follow `ApiResponse<T>` pattern with `success`, `data`, `message` fields
- Paginated responses extend this with `meta` object containing pagination info

**3. State Management Strategy**
The application uses **dual state management**:

a) **Redux (src/store/)** - For domain data caching:
   - Slices: personas, actividades, aulas, cuotas, recibos, familiares, categorias, tiposActividad, categoriasActividad, ui
   - Used for cached lists and complex state

b) **Context API (src/providers/)** - For globally shared catalogs:
   - `CatalogosProvider` loads catalogs once at app startup
   - Provides: tipos, categorias, estados, aulas, diasSemana, etc.
   - **Important:** The provider filters `diasSemana` to only IDs 1-7 (backend has duplicate IDs 8-14)
   - Access via `useCatalogosContext()` hook

**4. Form Handling Pattern**
- React Hook Form + Zod resolver for validation
- Schemas defined in `src/schemas/` (e.g., `persona.schema.ts`, `categoria.schema.ts`)
- Form types auto-generated from schemas via `z.infer<>`
- Example pattern:
  ```typescript
  const { control, handleSubmit } = useForm<CreatePersonaFormData>({
    resolver: zodResolver(createPersonaSchema)
  });
  ```

**5. Personas Module Architecture**
The Personas module implements a **multi-type system** where a person can have multiple types (SOCIO, DOCENTE, PROVEEDOR, NO_SOCIO) simultaneously:

- **V2 API** (`personasApi.ts`) with discriminated unions for type-specific fields
- **Zod discriminated unions** for type-safe validation per person type
- Each type has specific requirements:
  - `SOCIO`: requires `categoriaId`
  - `DOCENTE`: requires `especialidadId`, `honorariosPorHora`
  - `PROVEEDOR`: requires `cuit`, `razonSocial`
  - `NO_SOCIO`: basic type with no additional fields
- **Admin pages** for managing catalogs: TiposPersona, EspecialidadesDocente, TiposContacto
- **Contactos** system with principal contact validation

**6. Actividades Module Architecture**
Two versions coexist:
- **V1**: Legacy implementation (`ActividadDetallePage.tsx`)
- **V2**: Current implementation (`ActividadDetallePageV2.tsx`) - prefer this
- Routes: `/actividades`, `/actividades/nueva`, `/actividades/:id`, `/actividades/:id/editar`
- Uses catalog system from `CatalogosProvider`
- Types defined in `actividad.types.ts` with extensive documentation referencing backend API docs

### Path Aliasing
The project uses `@/` alias for `src/`:
```typescript
import { api } from '@/services/api';
import { Persona } from '@/types/persona.types';
```
Configured in both `vite.config.ts` and `tsconfig.json`.

### TypeScript Configuration
- **NOT strict mode** (`strict: false`)
- Most linting rules disabled (`noUnusedLocals`, `noImplicitAny`, etc.)
- When adding code, match the existing loose type style

### Component Organization
Components are organized by domain:
- `components/personas/` - Person-related components
- `components/actividades/` - Activity-related components
- `components/forms/` - Reusable form components
- `components/layout/` - Layout components (DashboardLayout, Header, Sidebar)
- `components/common/` - Shared components (ConfirmDeleteDialog)
- `components/ui/` - UI primitives
- `components/dialogs/` - Modal dialogs

### Naming Conventions
- API services: `*Api.ts` (e.g., `personasApi.ts`, `actividadesApi.ts`)
- Redux slices: `*Slice.ts` (e.g., `personasSlice.ts`)
- Schemas: `*.schema.ts` (e.g., `persona.schema.ts`)
- Types: `*.types.ts` (e.g., `persona.types.ts`)
- Pages: `*Page.tsx` (e.g., `PersonasPage.tsx`)
- Hooks: `use*.ts` (e.g., `usePersonas.ts`, `useActividades.ts`)

## Environment Setup

Create a `.env` file based on `.env.example`:

```env
VITE_API_URL=http://localhost:8000/api
VITE_DEV_MODE=true
VITE_APP_NAME=SIGESDA
VITE_APP_VERSION=1.0.0
```

Backend must be running on port 8000 for the proxy to work correctly.

## Key Files to Know

- `src/App.tsx` - Root component with all routes and providers setup
- `src/store/index.ts` - Redux store configuration
- `src/services/api.ts` - Axios instance with interceptors
- `src/providers/CatalogosProvider.tsx` - Global catalogs provider with diasSemana filtering
- `src/theme/index.ts` - MUI theme customization
- `vite.config.ts` - Vite configuration with proxy setup

## Domain-Specific Notes

### Personas
- V2 API supports multiple types per person
- Use discriminated unions for type-specific validation
- Contact validation: max 1 principal contact per person
- Admin catalogs are manageable via UI

### Actividades
- Prefer V2 pages and implementations
- Catalogs loaded globally via CatalogosProvider
- diasSemana catalog is filtered to IDs 1-7 (ignore 8-14)
- Extensive type definitions with JSDoc referencing backend API docs

### State Management
- Check if data should be in Redux (cached domain data) or Context (global catalogs)
- Redux for: personas, actividades, aulas, cuotas, recibos, familiares
- Context for: catalogos (tipos, categorias, estados, etc.)
- UI state (sidebar) goes in Redux uiSlice

## Development Server
- Frontend runs on port **3003**
- Backend expected on port **8000**
- API calls to `/api/*` are proxied to backend

## Known Issues

### Backend API Compatibility
Some frontend API calls may fail if backend endpoints are not implemented:
- `/api/catalogos/personas/todos` (404) - The `usePersonas` hook has fallback logic with default values
- Some endpoints may return 500 errors if backend database schema is incomplete

The application is designed to handle these gracefully with fallback data and error handling.

### MUI Grid Migration
The codebase uses deprecated MUI Grid v1 API (`item`, `xs`, `sm` props). MUI v7 requires Grid2 component. When updating Grid components:
- Remove `item` prop (no longer needed)
- Replace `xs`, `sm`, `md`, etc. with `size={{ xs: 12, sm: 6 }}` syntax
- Or import `Grid2` instead of `Grid` from `@mui/material`
- See: https://mui.com/material-ui/migration/upgrade-to-grid-v2/
