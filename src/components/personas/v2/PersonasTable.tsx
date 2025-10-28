import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Stack,
  Tooltip,
  Typography,
  Collapse,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import type { PersonaV2 } from '../../../types/personaV2.types';
import { TiposBadges } from './tipos';
import { getNombreCompleto } from '../../../types/personaV2.types';

interface PersonasTableProps {
  personas: PersonaV2[];
  onView?: (persona: PersonaV2) => void;
  onEdit?: (persona: PersonaV2) => void;
  onDelete?: (persona: PersonaV2) => void;
  showActions?: boolean;
  expandable?: boolean;
}

/**
 * Tabla modular para mostrar listado de personas
 * Soporta filas expandibles con información de contacto
 *
 * @example
 * ```tsx
 * <PersonasTable
 *   personas={personas}
 *   onView={handleView}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   expandable
 * />
 * ```
 */
export const PersonasTable: React.FC<PersonasTableProps> = ({
  personas,
  onView,
  onEdit,
  onDelete,
  showActions = true,
  expandable = true,
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRowExpansion = (personaId: number) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(personaId)) {
        newSet.delete(personaId);
      } else {
        newSet.add(personaId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'ACTIVO':
        return 'success';
      case 'INACTIVO':
        return 'default';
      case 'SUSPENDIDO':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (personas.length === 0) {
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {expandable && <TableCell sx={{ width: 40 }} />}
              <TableCell>Nombre Completo</TableCell>
              <TableCell>DNI</TableCell>
              <TableCell>Tipos</TableCell>
              <TableCell>Contacto</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Ingreso</TableCell>
              {showActions && <TableCell align="center">Acciones</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell colSpan={expandable ? 8 : 7} align="center">
                <Typography variant="body2" color="text.secondary" py={3}>
                  No se encontraron personas
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {expandable && <TableCell sx={{ width: 40 }} />}
            <TableCell>Nombre Completo</TableCell>
            <TableCell>DNI</TableCell>
            <TableCell>Tipos</TableCell>
            <TableCell>Contacto</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell>Ingreso</TableCell>
            {showActions && <TableCell align="center">Acciones</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {personas.map((persona) => {
            const isExpanded = expandedRows.has(persona.id);
            const hasEmail = !!persona.email;
            const hasPhone = !!persona.telefono;
            const hasContactInfo = hasEmail || hasPhone || !!persona.direccion;

            return (
              <React.Fragment key={persona.id}>
                <TableRow hover>
                  {/* Botón expandir */}
                  {expandable && (
                    <TableCell sx={{ padding: '4px' }}>
                      <IconButton
                        size="small"
                        onClick={() => toggleRowExpansion(persona.id)}
                        disabled={!hasContactInfo}
                      >
                        {isExpanded ? (
                          <KeyboardArrowDownIcon />
                        ) : (
                          <KeyboardArrowRightIcon />
                        )}
                      </IconButton>
                    </TableCell>
                  )}

                  {/* Nombre completo */}
                  <TableCell>
                    <Tooltip title={getNombreCompleto(persona)} placement="top">
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {getNombreCompleto(persona)}
                      </Typography>
                    </Tooltip>
                  </TableCell>

                  {/* DNI */}
                  <TableCell>
                    <Typography variant="body2">{persona.dni}</Typography>
                  </TableCell>

                  {/* Tipos */}
                  <TableCell>
                    {persona.tipos && persona.tipos.length > 0 ? (
                      <TiposBadges tipos={persona.tipos} max={2} size="small" />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Sin tipos
                      </Typography>
                    )}
                  </TableCell>

                  {/* Contacto (íconos) */}
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {hasEmail ? (
                        <EmailIcon fontSize="small" color="primary" />
                      ) : (
                        <EmailIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                      )}
                      {hasPhone ? (
                        <PhoneIcon fontSize="small" color="primary" />
                      ) : (
                        <PhoneIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                      )}
                    </Box>
                  </TableCell>

                  {/* Estado */}
                  <TableCell>
                    <Chip
                      label={persona.estado}
                      color={getEstadoColor(persona.estado) as any}
                      size="small"
                      variant={persona.estado === 'ACTIVO' ? 'filled' : 'outlined'}
                    />
                  </TableCell>

                  {/* Fecha de ingreso */}
                  <TableCell>
                    <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                      {formatDate(persona.fechaIngreso)}
                    </Typography>
                  </TableCell>

                  {/* Acciones */}
                  {showActions && (
                    <TableCell>
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        {onView && (
                          <Tooltip title="Ver detalles">
                            <IconButton size="small" onClick={() => onView(persona)} color="primary">
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {onEdit && (
                          <Tooltip title="Editar">
                            <IconButton size="small" onClick={() => onEdit(persona)} color="primary">
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {onDelete && (
                          <Tooltip title="Eliminar">
                            <IconButton size="small" onClick={() => onDelete(persona)} color="error">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  )}
                </TableRow>

                {/* Fila expandible con información de contacto */}
                {expandable && hasContactInfo && (
                  <TableRow>
                    <TableCell
                      colSpan={showActions ? 8 : 7}
                      sx={{ py: 0, backgroundColor: 'action.hover' }}
                    >
                      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <Box sx={{ py: 2, px: 4 }}>
                          <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                            Información de Contacto
                          </Typography>
                          <Stack spacing={1} sx={{ mt: 1 }}>
                            {hasEmail && (
                              <Box display="flex" alignItems="center" gap={1}>
                                <EmailIcon fontSize="small" color="primary" />
                                <Typography variant="body2" fontWeight={500}>
                                  Email:
                                </Typography>
                                <Typography variant="body2">{persona.email}</Typography>
                              </Box>
                            )}
                            {hasPhone && (
                              <Box display="flex" alignItems="center" gap={1}>
                                <PhoneIcon fontSize="small" color="primary" />
                                <Typography variant="body2" fontWeight={500}>
                                  Teléfono:
                                </Typography>
                                <Typography variant="body2">{persona.telefono}</Typography>
                              </Box>
                            )}
                            {persona.direccion && (
                              <Box display="flex" alignItems="center" gap={1}>
                                <LocationIcon fontSize="small" color="action" />
                                <Typography variant="body2" fontWeight={500}>
                                  Dirección:
                                </Typography>
                                <Typography variant="body2">{persona.direccion}</Typography>
                              </Box>
                            )}
                          </Stack>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PersonasTable;
