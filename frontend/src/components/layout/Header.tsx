// src/components/layout/Header.tsx

import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  AccountCircle,
  Dashboard,
  CalendarMonth,
  MeetingRoom,
  ExitToApp,
  Menu as MenuIcon,
  ViewList,
  Add,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { DarkMode, LightMode } from '@mui/icons-material';
import { useThemeStore } from '../../store/themeStore';

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { isAuthenticated, userEmail, isAdmin, logout } = useAuthStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
const { mode, toggleTheme } = useThemeStore();
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleClose();
    setDrawerOpen(false);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
  };

  if (!isAuthenticated) return null;

  // Пункты меню
  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <Dashboard /> },
    { label: 'Resources', path: '/resources', icon: <MeetingRoom /> },
    { label: 'My Bookings', path: '/bookings/my', icon: <CalendarMonth /> },
    { label: 'Calendar', path: '/bookings/calendar', icon: <CalendarMonth /> },
    ...(isAdmin ? [{ label: 'All Bookings', path: '/bookings/all', icon: <ViewList /> }] : []),
  ];

  // Мобильное меню (Drawer)
  const drawer = (
    <Box sx={{ width: 280 }}>
      {/* Шапка drawer */}
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6">📦 Resource Booking</Typography>
        <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
          {userEmail}
        </Typography>
        {isAdmin && (
          <Box
            sx={{
              display: 'inline-block',
              bgcolor: 'warning.main',
              color: 'warning.contrastText',
              px: 1,
              py: 0.25,
              borderRadius: 1,
              fontSize: '0.75rem',
              fontWeight: 'bold',
              mt: 1,
            }}
          >
            ADMIN
          </Box>
        )}
      </Box>

      <Divider />

      {/* Навигация */}
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              onClick={() => handleNavigate(item.path)}
              selected={location.pathname === item.path}
              sx={{
                '&.Mui-selected': {
                  bgcolor: 'primary.light',
                  color: 'primary.main',
                  '&:hover': { bgcolor: 'primary.light' },
                },
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      {/* Быстрые действия */}
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={() => handleNavigate('/bookings/create')}>
            <ListItemIcon>
              <Add />
            </ListItemIcon>
            <ListItemText primary="New Booking" />
          </ListItemButton>
        </ListItem>
      </List>

      <Divider />

      {/* Выход */}
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <ExitToApp />
            </ListItemIcon>
            <ListItemText primary="Sign Out" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          {/* Бургер меню для мобильных */}
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Логотип */}
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: isMobile ? 1 : 0,
              mr: isMobile ? 0 : 4,
              cursor: 'pointer',
              fontSize: { xs: '1rem', sm: '1.25rem' },
            }}
            onClick={() => navigate('/dashboard')}
          >
            📦 {!isMobile && 'Resource Booking'}
          </Typography>

          {/* Десктопная навигация */}
          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: 'flex', gap: 0.5 }}>
              {menuItems.map((item) => (
                <Button
                  key={item.path}
                  color="inherit"
                  startIcon={item.icon}
                  onClick={() => navigate(item.path)}
                  sx={{
                    bgcolor: location.pathname === item.path ? 'rgba(255,255,255,0.1)' : 'transparent',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {/* Пользовательское меню (для десктопа) */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ mr: 1 }}>
                {userEmail}
              </Typography>
              {isAdmin && (
                <Typography
                  variant="caption"
                  sx={{
                    bgcolor: 'warning.main',
                    color: 'warning.contrastText',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    fontWeight: 'bold',
                  }}
                >
                  ADMIN
                </Typography>
              )}
              {/* Переключатель темы */}
<IconButton color="inherit" onClick={toggleTheme}>
  {mode === 'light' ? <DarkMode /> : <LightMode />}
</IconButton>
              <IconButton
                size="large"
                aria-label="account menu"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem disabled>
                  <Typography variant="body2" color="text.secondary">
                    {userEmail}
                  </Typography>
                </MenuItem>
                <MenuItem disabled>
                  <Typography variant="caption" color="text.secondary">
                    Role: {isAdmin ? 'Administrator' : 'User'}
                  </Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ExitToApp sx={{ mr: 1 }} fontSize="small" />
                  Sign Out
                </MenuItem>
              </Menu>
            </Box>
          )}

          {/* Иконка профиля для мобильных */}
          {isMobile && (
            <IconButton color="inherit" onClick={handleMenu}>
              <AccountCircle />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Мобильный Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        {drawer}
      </Drawer>
    </>
  );
};