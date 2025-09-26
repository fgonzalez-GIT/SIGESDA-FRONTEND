import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import {
  People,
  MusicNote,
  Payment,
  TrendingUp,
} from '@mui/icons-material';

const Dashboard: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard Principal
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Bienvenido al Sistema de Gestión de Asociación Musical
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <People color="primary" />
                <Box>
                  <Typography variant="h6">156</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Socios
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <MusicNote color="secondary" />
                <Box>
                  <Typography variant="h6">12</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Actividades Activas
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Payment color="success" />
                <Box>
                  <Typography variant="h6">$45,200</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Recaudación Mensual
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <TrendingUp color="warning" />
                <Box>
                  <Typography variant="h6">23</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cuotas Pendientes
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Acciones Rápidas
              </Typography>
              <Box display="flex" gap={2} flexWrap="wrap">
                <Button variant="contained" color="primary">
                  Generar Cuotas del Mes
                </Button>
                <Button variant="outlined" color="secondary">
                  Registrar Nuevo Pago
                </Button>
                <Button variant="outlined" color="success">
                  Ver Reportes
                </Button>
                <Button variant="outlined" color="warning">
                  Cuotas Vencidas
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;