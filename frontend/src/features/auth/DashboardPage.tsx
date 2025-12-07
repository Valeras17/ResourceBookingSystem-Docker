// src/features/auth/DashboardPage.tsx

import { Container, Box, Typography, Button, Paper, Grid as Grid, Card, CardContent, CardActions } from '@mui/material';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { Dashboard, CalendarMonth, MeetingRoom, Add } from '@mui/icons-material';

export const DashboardPage = () => {
  const { userEmail, isAdmin } = useAuthStore();
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Dashboard sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
            <Box>
              <Typography variant="h4" component="h1">
                Welcome Back!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {userEmail} • {isAdmin ? 'Administrator' : 'User'}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Быстрые действия */}
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Quick Actions
        </Typography>

        <Grid container spacing={3}>
          {/* Просмотр ресурсов */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <MeetingRoom sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Typography variant="h6">Browse Resources</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  View all available resources and their availability
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => navigate('/resources')}
                >
                  View Resources
                </Button>
              </CardActions>
            </Card>
          </Grid>

          {/* Создать бронирование */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Add sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                  <Typography variant="h6">Create Booking</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Book a resource for your meeting or event
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  onClick={() => navigate('/bookings/create')}
                >
                  New Booking
                </Button>
              </CardActions>
            </Card>
          </Grid>

          {/* Мои бронирования */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CalendarMonth sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                  <Typography variant="h6">My Bookings</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  View and manage your existing bookings
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  fullWidth
                  variant="contained"
                  color="info"
                  onClick={() => navigate('/bookings/my')}
                >
                  View My Bookings
                </Button>
              </CardActions>
            </Card>
          </Grid>

          {/* Админ функции */}
          {isAdmin && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ bgcolor: 'warning.light' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Dashboard sx={{ fontSize: 40, color: 'warning.dark', mr: 2 }} />
                    <Typography variant="h6" color="warning.dark">
                      Admin Panel
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="warning.dark">
                    Manage resources and view all system bookings
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    fullWidth
                    variant="contained"
                    color="warning"
                    onClick={() => navigate('/resources')}
                  >
                    Manage Resources
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          )}
        </Grid>
      </Box>
    </Container>
  );
};