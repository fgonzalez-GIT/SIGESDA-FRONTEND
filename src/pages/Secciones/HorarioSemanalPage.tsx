import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import seccionesApi from '../../services/seccionesApi';
import { HorarioSemanalResponse, SeccionHorarioSemanal } from '../../types/seccion.types';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Refresh as RefreshIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { DIAS_SEMANA } from '../../constants/secciones.constants';

interface HorarioAgrupado {
  hora: string;
  secciones: {
    [dia: string]: SeccionHorarioSemanal[];
  };
}

const HorarioSemanalPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [horariosPorDia, setHorariosPorDia] = useState<HorarioSemanalResponse[]>([]);
  const [vistaActual, setVistaActual] = useState<'completo' | 'compacto'>('completo');

  useEffect(() => {
    loadHorarioSemanal();
  }, []);

  const loadHorarioSemanal = async () => {
    setLoading(true);
    try {
      const response = await seccionesApi.getHorarioSemanal();
      setHorariosPorDia(response.data);
    } catch (error) {
      console.error('Error al cargar horario semanal:', error);
    } finally {
      setLoading(false);
    }
  };

  // Agrupar por hora de inicio para crear filas de la tabla
  const horariosAgrupados: HorarioAgrupado[] = React.useMemo(() => {
    const horas = new Set<string>();

    // Recolectar todas las horas de inicio únicas
    horariosPorDia.forEach(dia => {
      dia.secciones.forEach(seccion => {
        const horaInicio = seccion.horario.split('-')[0].trim();
        horas.add(horaInicio);
      });
    });

    const horasOrdenadas = Array.from(horas).sort();

    // Para cada hora, encontrar las secciones de cada día
    return horasOrdenadas.map(hora => {
      const secciones: { [dia: string]: SeccionHorarioSemanal[] } = {};

      DIAS_SEMANA.forEach(diaConfig => {
        const diaData = horariosPorDia.find(d => d.dia === diaConfig.value);
        if (diaData) {
          secciones[diaConfig.value] = diaData.secciones.filter(seccion => {
            const horaInicio = seccion.horario.split('-')[0].trim();
            return horaInicio === hora;
          });
        } else {
          secciones[diaConfig.value] = [];
        }
      });

      return { hora, secciones };
    });
  }, [horariosPorDia]);

  // Calcular estadísticas
  const stats = React.useMemo(() => {
    const seccionesUnicas = new Set<string>();
    const aulasUnicas = new Set<string>();
    const docentesUnicos = new Set<string>();
    let totalHorarios = 0;

    horariosPorDia.forEach(dia => {
      dia.secciones.forEach(seccion => {
        seccionesUnicas.add(seccion.seccionId);
        if (seccion.aula) aulasUnicas.add(seccion.aula);
        seccion.docentes.forEach(docente => docentesUnicos.add(docente));
        totalHorarios++;
      });
    });

    return {
      totalSecciones: seccionesUnicas.size,
      totalHorarios,
      totalAulas: aulasUnicas.size,
      totalDocentes: docentesUnicos.size
    };
  }, [horariosPorDia]);

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // Crear CSV simple
    let csv = 'Horario Semanal\n\n';
    csv += 'Hora,' + DIAS_SEMANA.map(d => d.label).join(',') + '\n';

    horariosAgrupados.forEach(grupo => {
      const row = [grupo.hora];
      DIAS_SEMANA.forEach(dia => {
        const secciones = grupo.secciones[dia.value];
        const texto = secciones.map(s => `${s.actividadNombre} - ${s.seccionNombre}`).join(' | ');
        row.push(texto || '-');
      });
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'horario-semanal.csv';
    a.click();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate('/secciones')}
          >
            Volver
          </Button>
          <Box>
            <Typography variant="h4" component="h1">
              Horario Semanal
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Vista completa de todas las secciones por día y hora
            </Typography>
          </Box>
        </Box>
        <Box display="flex" gap={2}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Vista</InputLabel>
            <Select
              value={vistaActual}
              onChange={(e) => setVistaActual(e.target.value as any)}
              label="Vista"
            >
              <MenuItem value="completo">Completo</MenuItem>
              <MenuItem value="compacto">Compacto</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Actualizar">
            <IconButton onClick={loadHorarioSemanal} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Imprimir">
            <IconButton onClick={handlePrint} color="primary">
              <PrintIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Exportar CSV">
            <IconButton onClick={handleExport} color="primary">
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Estadísticas */}
      <Box display="flex" gap={2} mb={3}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="caption" color="text.secondary">
              Total Secciones
            </Typography>
            <Typography variant="h4" color="primary">
              {stats.totalSecciones}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="caption" color="text.secondary">
              Total Horarios
            </Typography>
            <Typography variant="h4" color="secondary">
              {stats.totalHorarios}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="caption" color="text.secondary">
              Aulas en Uso
            </Typography>
            <Typography variant="h4" color="info.main">
              {stats.totalAulas}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="caption" color="text.secondary">
              Docentes
            </Typography>
            <Typography variant="h4" color="success.main">
              {stats.totalDocentes}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Alerta informativa */}
      <Alert severity="info" sx={{ mb: 3 }} icon={<InfoIcon />}>
        Haz clic en cualquier sección para ver sus detalles completos
      </Alert>

      {/* Tabla de horarios */}
      {horariosAgrupados.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No hay horarios configurados
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Las secciones con horarios aparecerán aquí
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ '@media print': { boxShadow: 'none' } }}>
          <Table size={vistaActual === 'compacto' ? 'small' : 'medium'}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white' }}>
                  Hora
                </TableCell>
                {DIAS_SEMANA.map(dia => (
                  <TableCell
                    key={dia.value}
                    align="center"
                    sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white' }}
                  >
                    {dia.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {horariosAgrupados.map((grupo) => (
                <TableRow key={grupo.hora} hover>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>
                    {grupo.hora}
                  </TableCell>
                  {DIAS_SEMANA.map(dia => {
                    const secciones = grupo.secciones[dia.value];
                    return (
                      <TableCell
                        key={dia.value}
                        sx={{
                          verticalAlign: 'top',
                          bgcolor: secciones.length > 0 ? 'background.paper' : 'grey.50'
                        }}
                      >
                        {secciones.length === 0 ? (
                          <Typography variant="body2" color="text.secondary" align="center">
                            -
                          </Typography>
                        ) : (
                          <Box display="flex" flexDirection="column" gap={1}>
                            {secciones.map((seccion, idx) => (
                              <Card
                                key={`${seccion.seccionId}-${idx}`}
                                sx={{
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  '&:hover': {
                                    boxShadow: 3,
                                    transform: 'translateY(-2px)'
                                  },
                                  '@media print': {
                                    boxShadow: 'none',
                                    border: '1px solid #ccc'
                                  }
                                }}
                                onClick={() => navigate(`/secciones/${seccion.seccionId}`)}
                              >
                                <CardContent sx={{ p: vistaActual === 'compacto' ? 1 : 2, '&:last-child': { pb: vistaActual === 'compacto' ? 1 : 2 } }}>
                                  {vistaActual === 'completo' ? (
                                    <>
                                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                        {seccion.actividadNombre}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary" gutterBottom>
                                        {seccion.seccionNombre}
                                      </Typography>
                                      <Typography variant="caption" display="block" gutterBottom>
                                        {seccion.horario}
                                      </Typography>
                                      {seccion.aula && (
                                        <Chip
                                          label={seccion.aula}
                                          size="small"
                                          color="info"
                                          sx={{ mb: 0.5 }}
                                        />
                                      )}
                                      {seccion.docentes.length > 0 && (
                                        <Box mt={0.5}>
                                          {seccion.docentes.map((docente, dIdx) => (
                                            <Chip
                                              key={`${seccion.seccionId}-docente-${dIdx}`}
                                              label={docente}
                                              size="small"
                                              variant="outlined"
                                              sx={{ mr: 0.5, mb: 0.5 }}
                                            />
                                          ))}
                                        </Box>
                                      )}
                                      <Box mt={1} display="flex" justifyContent="space-between" alignItems="center">
                                        <Chip
                                          label={`${seccion.participantes} participantes`}
                                          size="small"
                                          color="success"
                                        />
                                        {seccion.capacidad && (
                                          <Typography variant="caption" color="text.secondary">
                                            Cap: {seccion.participantes}/{seccion.capacidad}
                                          </Typography>
                                        )}
                                      </Box>
                                    </>
                                  ) : (
                                    <>
                                      <Typography variant="body2" fontWeight="bold">
                                        {seccion.actividadNombre}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary" display="block">
                                        {seccion.seccionNombre} • {seccion.horario}
                                      </Typography>
                                      {seccion.aula && (
                                        <Typography variant="caption" color="info.main" display="block">
                                          {seccion.aula}
                                        </Typography>
                                      )}
                                    </>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </Box>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default HorarioSemanalPage;
