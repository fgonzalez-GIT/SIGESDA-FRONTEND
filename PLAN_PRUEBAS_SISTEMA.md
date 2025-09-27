# Plan de Pruebas del Sistema - SIGESDA

## 1. INFORMACIÓN GENERAL

**Sistema:** SIGESDA (Sistema de Gestión)
**Tecnologías:** React 18, TypeScript, Material-UI, Redux Toolkit, Vite
**Fecha de Plan:** 27 de Septiembre 2025
**Versión:** 1.0

## 2. OBJETIVOS

- Verificar el correcto funcionamiento de todos los módulos implementados
- Validar la integración entre frontend y backend API
- Asegurar la usabilidad y experiencia de usuario
- Confirmar la estabilidad del sistema bajo diferentes escenarios

## 3. ALCANCE DE PRUEBAS

### 3.1 Módulos a Probar (Implementados)
- ✅ **Dashboard**: Panel principal con estadísticas y widgets
- ✅ **Personas**: Gestión de personas del sistema
- ✅ **Actividades**: Administración de actividades
- ✅ **Cuotas**: Manejo de cuotas y generación masiva
- ✅ **Recibos**: Generación y visualización de recibos
- ✅ **Familiares**: Gestión de relaciones familiares

### 3.2 Módulos Excluidos (En Desarrollo)
- 🚧 Aulas, Medios de Pago, Configuración, Participación, Reservas

## 4. TIPOS DE PRUEBAS

### 4.1 Pruebas Funcionales
- **Navegación y Ruteo**: Verificar que todas las rutas funcionen correctamente
- **CRUD Operations**: Crear, leer, actualizar y eliminar registros
- **Formularios**: Validación de campos y envío de datos
- **Integración API**: Comunicación con backend (GET, POST, PUT, DELETE)

### 4.2 Pruebas de Interfaz de Usuario
- **Responsividad**: Comportamiento en diferentes resoluciones
- **Componentes Material-UI**: Funcionamiento de DataGrid, formularios, diálogos
- **Estados de Carga**: Indicadores de progreso y spinners
- **Manejo de Errores**: Mensajes de error y validaciones

### 4.3 Pruebas de Integración
- **Redux Store**: Estado global y sincronización
- **Comunicación API**: Interceptores y manejo de respuestas
- **Flujos Completos**: Procesos end-to-end por módulo

## 5. CASOS DE PRUEBA POR MÓDULO

### 5.1 Dashboard
| ID | Descripción | Pasos | Resultado Esperado |
|----|-------------|-------|-------------------|
| DSH-01 | Cargar dashboard principal | 1. Navegar a /dashboard | Se muestran widgets, estadísticas y acciones rápidas |
| DSH-02 | Verificar widgets | 1. Revisar StatCard, ChartWidget, NotificationWidget | Datos se cargan correctamente |
| DSH-03 | Actividad reciente | 1. Verificar RecentActivity | Lista de actividades recientes visible |

### 5.2 Personas
| ID | Descripción | Pasos | Resultado Esperado |
|----|-------------|-------|-------------------|
| PER-01 | Listar personas | 1. Navegar a /personas | DataGrid muestra lista de personas |
| PER-02 | Crear persona | 1. Clic en "Agregar"<br>2. Llenar formulario<br>3. Guardar | Nueva persona creada y visible en lista |
| PER-03 | Editar persona | 1. Seleccionar persona<br>2. Modificar datos<br>3. Guardar | Datos actualizados correctamente |
| PER-04 | Eliminar persona | 1. Seleccionar persona<br>2. Confirmar eliminación | Persona removida de la lista |

### 5.3 Actividades
| ID | Descripción | Pasos | Resultado Esperado |
|----|-------------|-------|-------------------|
| ACT-01 | Listar actividades | 1. Navegar a /actividades | DataGrid muestra actividades |
| ACT-02 | Crear actividad | 1. Clic en "Nueva Actividad"<br>2. Completar formulario<br>3. Guardar | Actividad creada exitosamente |
| ACT-03 | Filtrar actividades | 1. Usar filtros del DataGrid | Resultados filtrados correctamente |

### 5.4 Cuotas
| ID | Descripción | Pasos | Resultado Esperado |
|----|-------------|-------|-------------------|
| CUO-01 | Listar cuotas | 1. Navegar a /cuotas | DataGrid muestra cuotas |
| CUO-02 | Generar cuota individual | 1. Clic en "Nueva Cuota"<br>2. Completar formulario<br>3. Guardar | Cuota generada correctamente |
| CUO-03 | Generar cuotas masivas | 1. Clic en "Generar Masivas"<br>2. Configurar parámetros<br>3. Ejecutar | Múltiples cuotas generadas |
| CUO-04 | Validar descuentos familiares | 1. Aplicar descuentos<br>2. Verificar cálculos | Descuentos aplicados correctamente |

### 5.5 Recibos
| ID | Descripción | Pasos | Resultado Esperado |
|----|-------------|-------|-------------------|
| REC-01 | Listar recibos | 1. Navegar a /recibos | DataGrid muestra recibos |
| REC-02 | Generar recibo | 1. Seleccionar cuota<br>2. Generar recibo<br>3. Visualizar | Recibo generado y visualizable |
| REC-03 | Ver detalles de recibo | 1. Clic en recibo<br>2. Abrir ReciboViewer | Detalles completos del recibo |
| REC-04 | Imprimir recibo | 1. Usar función de impresión | Recibo se imprime correctamente |

### 5.6 Familiares
| ID | Descripción | Pasos | Resultado Esperado |
|----|-------------|-------|-------------------|
| FAM-01 | Listar relaciones familiares | 1. Navegar a /familiares | Lista de relaciones familiares |
| FAM-02 | Crear relación familiar | 1. Clic en "Nueva Relación"<br>2. Completar datos<br>3. Guardar | Relación familiar creada |
| FAM-03 | Aplicar descuentos familiares | 1. Configurar descuentos<br>2. Aplicar a grupo familiar | Descuentos aplicados correctamente |

## 6. CRITERIOS DE ACEPTACIÓN

### 6.1 Funcionalidad
- ✅ Todas las operaciones CRUD funcionan sin errores
- ✅ La navegación entre módulos es fluida
- ✅ Los formularios validan datos correctamente
- ✅ La comunicación con la API es estable

### 6.2 Rendimiento
- ✅ Tiempo de carga inicial < 3 segundos
- ✅ Navegación entre páginas < 1 segundo
- ✅ Operaciones de datos < 2 segundos

### 6.3 Usabilidad
- ✅ Interfaz intuitiva y coherente
- ✅ Mensajes de error claros y útiles
- ✅ Responsividad en dispositivos móviles
- ✅ Accesibilidad básica implementada

## 7. AMBIENTE DE PRUEBAS

### 7.1 Configuración
- **Frontend**: http://localhost:5173 (Vite dev server)
- **Backend API**: http://localhost:3001/api
- **Navegadores**: Chrome, Firefox, Safari, Edge
- **Dispositivos**: Desktop, Tablet, Mobile

### 7.2 Datos de Prueba
- Base de datos con datos de ejemplo
- Usuarios de prueba con diferentes roles
- Escenarios de datos válidos e inválidos

## 8. CRONOGRAMA DE EJECUCIÓN

| Fase | Actividad | Duración | Responsable |
|------|-----------|----------|-------------|
| 1 | Preparación del ambiente | 1 día | Desarrollo |
| 2 | Pruebas de Dashboard | 0.5 días | QA |
| 3 | Pruebas de Personas | 1 día | QA |
| 4 | Pruebas de Actividades | 1 día | QA |
| 5 | Pruebas de Cuotas | 1.5 días | QA |
| 6 | Pruebas de Recibos | 1 día | QA |
| 7 | Pruebas de Familiares | 1 día | QA |
| 8 | Pruebas de Integración | 1 día | QA |
| 9 | Reporte final | 0.5 días | QA |

**Total estimado: 8.5 días**

## 9. ENTREGABLES

- ✅ Plan de pruebas (este documento)
- 📋 Casos de prueba detallados
- 📊 Matriz de trazabilidad
- 🐛 Reporte de defectos
- 📈 Reporte de resultados de pruebas
- ✅ Certificado de aceptación

## 10. RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| API no disponible | Media | Alto | Configurar mock de API para pruebas |
| Defectos críticos | Media | Alto | Realizar pruebas incrementales |
| Cambios de requerimientos | Baja | Medio | Mantener comunicación constante |
| Problemas de rendimiento | Baja | Alto | Pruebas de carga tempranas |

## 11. HERRAMIENTAS SUGERIDAS

### 11.1 Pruebas Manuales
- Navegadores web
- DevTools
- Postman (para API)
- Lighthouse (performance)

### 11.2 Pruebas Automatizadas (Futuro)
- Jest + React Testing Library
- Cypress o Playwright
- ESLint + TypeScript
- Husky (pre-commit hooks)

## 12. CONTACTOS

| Rol | Nombre | Email |
|-----|--------|-------|
| Líder de Proyecto | [Nombre] | [email] |
| Desarrollador Frontend | [Nombre] | [email] |
| QA Tester | [Nombre] | [email] |
| Product Owner | [Nombre] | [email] |

---

**Nota**: Este plan debe ser revisado y actualizado conforme se implementen los módulos restantes del sistema.