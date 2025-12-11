import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { store } from './store';
import { theme } from './theme';
import DashboardLayout from './components/layout/DashboardLayout';
import { CatalogosProvider } from './providers/CatalogosProvider';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { selectIsAuthenticated } from './store/slices/authSlice';

// Auth Pages
import { LoginPage } from './pages/Auth/LoginPage';
import { UnauthorizedPage } from './pages/Auth/UnauthorizedPage';

// Pages
import Dashboard from './pages/Dashboard/Dashboard';
import PersonasPage from './pages/Personas/PersonasPage';
import PersonaDetallePage from './pages/Personas/PersonaDetallePage';
import TiposPersonaAdminPage from './pages/Personas/Admin/TiposPersonaAdminPage';
import EspecialidadesDocenteAdminPage from './pages/Personas/Admin/EspecialidadesDocenteAdminPage';
import TiposContactoAdminPage from './pages/Personas/Admin/TiposContactoAdminPage';
import AulasPage from './pages/Aulas/AulasPage';
import EquipamientosAdminPage from './pages/Equipamientos/Admin/EquipamientosAdminPage';
import CuotasPage from './pages/Cuotas/CuotasPage';
import MediosPagoPage from './pages/MediosPago/MediosPagoPage';
import RecibosPage from './pages/Recibos/RecibosPage';
import ParticipacionPage from './pages/Participacion/ParticipacionPage';
import FamiliaresPage from './pages/Familiares/FamiliaresPage';
import ReservasPage from './pages/Reservas/ReservasPage';
import ReservaDetallePage from './pages/Reservas/ReservaDetallePage';
import DashboardReservasPage from './pages/Reservas/DashboardReservasPage';
import ConfiguracionPage from './pages/Configuracion/ConfiguracionPage';
import CategoriasPage from './pages/Categorias/CategoriasPage';
import TiposActividadPage from './pages/TiposActividad/TiposActividadPage';
import CategoriasActividadPage from './pages/CategoriasActividad/CategoriasActividadPage';

// Actividades
import ActividadesPage from './pages/Actividades/ActividadesPage';
import ActividadDetallePage from './pages/Actividades/ActividadDetallePage';
import ActividadDetallePageV2 from './pages/Actividades/ActividadDetallePageV2';
import ActividadFormPage from './pages/Actividades/ActividadFormPage';

/**
 * Componente para redirigir la ruta raíz según autenticación
 */
const RootRedirect = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
};

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CatalogosProvider>
          <Router>
            <Routes>
              {/* ============ RUTAS PÚBLICAS (Sin Layout) ============ */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />

              {/* ============ RUTAS PROTEGIDAS (Con Layout) ============ */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Routes>
                        {/* Root */}
                        <Route path="/" element={<RootRedirect />} />
                        <Route path="/dashboard" element={<Dashboard />} />

                        {/* ===== Personas ===== */}
                        <Route path="/personas" element={<PersonasPage />} />
                        <Route path="/personas/:id" element={<PersonaDetallePage />} />

                        {/* ===== Admin - Catálogos de Personas ===== */}
                        <Route
                          path="/admin/personas/tipos"
                          element={
                            <ProtectedRoute allowedRoles={['admin', 'admin_catalogos']}>
                              <TiposPersonaAdminPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/admin/personas/especialidades"
                          element={
                            <ProtectedRoute allowedRoles={['admin', 'admin_catalogos']}>
                              <EspecialidadesDocenteAdminPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/admin/personas/tipos-contacto"
                          element={
                            <ProtectedRoute allowedRoles={['admin', 'admin_catalogos']}>
                              <TiposContactoAdminPage />
                            </ProtectedRoute>
                          }
                        />

                        {/* ===== Actividades ===== */}
                        <Route path="/actividades" element={<ActividadesPage />} />
                        <Route path="/actividades/nueva" element={<ActividadFormPage />} />
                        <Route path="/actividades/:id" element={<ActividadDetallePageV2 />} />
                        <Route path="/actividades/:id/v1" element={<ActividadDetallePage />} />
                        <Route path="/actividades/:id/editar" element={<ActividadFormPage />} />

                        {/* ===== Admin - Catálogos de Actividades ===== */}
                        <Route
                          path="/admin/actividades/tipos"
                          element={
                            <ProtectedRoute allowedRoles={['admin', 'admin_catalogos']}>
                              <TiposActividadPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/admin/actividades/categorias"
                          element={
                            <ProtectedRoute allowedRoles={['admin', 'admin_catalogos']}>
                              <CategoriasActividadPage />
                            </ProtectedRoute>
                          }
                        />

                        {/* ===== Aulas ===== */}
                        <Route path="/aulas" element={<AulasPage />} />

                        {/* ===== Admin - Catálogos de Aulas ===== */}
                        <Route
                          path="/admin/aulas/equipamientos"
                          element={
                            <ProtectedRoute allowedRoles={['admin', 'admin_catalogos']}>
                              <EquipamientosAdminPage />
                            </ProtectedRoute>
                          }
                        />

                        {/* ===== Otros Módulos ===== */}
                        <Route path="/cuotas" element={<CuotasPage />} />
                        <Route path="/categorias" element={<CategoriasPage />} />
                        <Route path="/medios-pago" element={<MediosPagoPage />} />
                        <Route path="/recibos" element={<RecibosPage />} />
                        <Route path="/participacion" element={<ParticipacionPage />} />
                        <Route path="/familiares" element={<FamiliaresPage />} />

                        {/* ===== Reservas ===== */}
                        <Route path="/reservas" element={<ReservasPage />} />
                        <Route path="/reservas/dashboard" element={<DashboardReservasPage />} />
                        <Route path="/reservas/:id" element={<ReservaDetallePage />} />

                        {/* ===== Configuración ===== */}
                        <Route
                          path="/configuracion"
                          element={
                            <ProtectedRoute allowedRoles={['admin']}>
                              <ConfiguracionPage />
                            </ProtectedRoute>
                          }
                        />

                        {/* ===== Redirects para rutas antiguas ===== */}
                        <Route path="/tipos-actividad" element={<Navigate to="/admin/actividades/tipos" replace />} />
                        <Route path="/categorias-actividad" element={<Navigate to="/admin/actividades/categorias" replace />} />
                      </Routes>
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </CatalogosProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;