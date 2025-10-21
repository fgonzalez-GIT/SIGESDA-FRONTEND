import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Toolbar,
} from '@mui/material';
import {
  Dashboard,
  People,
  MusicNote,
  Room,
  Settings,
  Group,
  GroupAdd,
  CalendarToday,
  Receipt,
  Payment,
  AccountBalance,
  Category,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const DRAWER_WIDTH = 280;

const menuItems = [
  {
    title: 'Dashboard',
    icon: <Dashboard />,
    path: '/dashboard',
    color: '#1976d2',
  },
  {
    title: 'Personas',
    icon: <People />,
    path: '/personas',
    color: '#2e7d32',
  },
  {
    title: 'Actividades',
    icon: <MusicNote />,
    path: '/actividades',
    color: '#ed6c02',
  },
  {
    title: 'Aulas',
    icon: <Room />,
    path: '/aulas',
    color: '#9c27b0',
  },
  {
    title: 'Participación',
    icon: <Group />,
    path: '/participacion',
    color: '#d32f2f',
  },
  {
    title: 'Familiares',
    icon: <GroupAdd />,
    path: '/familiares',
    color: '#f57c00',
  },
  {
    title: 'Reservas',
    icon: <CalendarToday />,
    path: '/reservas',
    color: '#303f9f',
  },
  {
    title: 'Recibos',
    icon: <Receipt />,
    path: '/recibos',
    color: '#388e3c',
  },
  {
    title: 'Cuotas',
    icon: <AccountBalance />,
    path: '/cuotas',
    color: '#1976d2',
  },
  {
    title: 'Categorías',
    icon: <Category />,
    path: '/categorias',
    color: '#e91e63',
  },
  {
    title: 'Tipos de Actividad',
    icon: <Category />,
    path: '/tipos-actividad',
    color: '#00897b',
  },
  {
    title: 'Categorías de Actividad',
    icon: <Category />,
    path: '/categorias-actividad',
    color: '#6a1b9a',
  },
  {
    title: 'Medios de Pago',
    icon: <Payment />,
    path: '/medios-pago',
    color: '#7b1fa2',
  },
  {
    title: 'Configuración',
    icon: <Settings />,
    path: '/configuracion',
    color: '#616161',
  }
];

interface SidebarProps {
  open: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ open }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          backgroundColor: '#f8f9fa',
          borderRight: '1px solid #e0e0e0',
        },
      }}
    >
      <Toolbar />

      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h5" component="h1" fontWeight="bold" color="primary">
          🎵 SIGESDA
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sistema de Gestión Musical
        </Typography>
      </Box>

      <Divider />

      <List sx={{ pt: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.5, px: 1 }}>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: `${item.color}15`,
                  '& .MuiListItemIcon-root': {
                    color: item.color,
                  },
                  '& .MuiListItemText-primary': {
                    color: item.color,
                    fontWeight: 600,
                  },
                },
                '&:hover': {
                  backgroundColor: `${item.color}08`,
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.title}
                primaryTypographyProps={{
                  fontSize: '0.9rem',
                  fontWeight: location.pathname === item.path ? 600 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;