import React from 'react';
import { Chip } from '@mui/material';
import {
  MusicNote as CoroIcon,
  Mic as CantoIcon,
  Piano as InstrumentoIcon,
  Palette as TallerIcon,
  Event as EventoIcon,
  Category as DefaultIcon,
} from '@mui/icons-material';
import type { TipoActividadBadgeProps } from '../../types/tipoActividad.types';

/**
 * Componente Badge reutilizable para mostrar Tipos de Actividad
 * Muestra un chip con color e ícono según el código del tipo
 */
export const TipoActividadBadge: React.FC<TipoActividadBadgeProps> = ({
  tipo,
  showCodigo = false,
  size = 'medium',
}) => {
  /**
   * Obtiene el color del chip según el código del tipo
   */
  const getColor = (): 'primary' | 'success' | 'info' | 'warning' | 'secondary' | 'default' => {
    switch (tipo.codigo.toUpperCase()) {
      case 'CORO':
        return 'primary';
      case 'CLASE_CANTO':
      case 'CANTO':
        return 'success';
      case 'CLASE_INSTRUMENTO':
      case 'INSTRUMENTO':
        return 'info';
      case 'TALLER':
        return 'warning';
      case 'EVENTO':
        return 'secondary';
      default:
        return 'default';
    }
  };

  /**
   * Obtiene el ícono según el código del tipo
   */
  const getIcon = () => {
    switch (tipo.codigo.toUpperCase()) {
      case 'CORO':
        return <CoroIcon />;
      case 'CLASE_CANTO':
      case 'CANTO':
        return <CantoIcon />;
      case 'CLASE_INSTRUMENTO':
      case 'INSTRUMENTO':
        return <InstrumentoIcon />;
      case 'TALLER':
        return <TallerIcon />;
      case 'EVENTO':
        return <EventoIcon />;
      default:
        return <DefaultIcon />;
    }
  };

  /**
   * Genera la etiqueta del chip
   */
  const getLabel = () => {
    if (showCodigo) {
      return `${tipo.codigo} - ${tipo.nombre}`;
    }
    return tipo.nombre;
  };

  return (
    <Chip
      icon={getIcon()}
      label={getLabel()}
      color={getColor()}
      size={size}
      variant={tipo.activo ? 'filled' : 'outlined'}
    />
  );
};

export default TipoActividadBadge;
