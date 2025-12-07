// src/features/bookings/BookingCalendarPage.tsx

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import { Add, CalendarMonth, AccessTime } from '@mui/icons-material';
import { bookingsAPI } from '../../api/bookings.api';
import { useAuthStore } from '../../store/authStore';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDateTime } from '../../utils/dateUtils';

import 'react-big-calendar/lib/css/react-big-calendar.css';

// Настройка локализатора для date-fns
const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resourceName: string;
  resourceId: number;
  isOwn: boolean;
}

export const BookingCalendarPage = () => {
  const navigate = useNavigate();
  const { isAdmin, userEmail } = useAuthStore();
  
  // Все состояния в одном месте
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<'month' | 'week' | 'day' | 'agenda'>('week');

  // Загружаем все бронирования (для админа) или свои (для пользователя)
  const { data, isLoading } = useQuery({
    queryKey: ['calendar-bookings'],
    queryFn: () => isAdmin 
      ? bookingsAPI.getAllBookings(0, 1000) 
      : bookingsAPI.getMyBookings(0, 1000),
  });

  // Преобразуем бронирования в события календаря
  const events: CalendarEvent[] = useMemo(() => {
    if (!data?.data.content) return [];
    
    return data.data.content.map((booking) => ({
      id: booking.id,
      title: `${booking.resourceName}`,
      start: new Date(booking.startTime),
      end: new Date(booking.endTime),
      resourceName: booking.resourceName,
      resourceId: booking.resourceId,
      isOwn: booking.userEmail === userEmail,
    }));
  }, [data, userEmail]);

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setDialogOpen(true);
  };

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    const startISO = start.toISOString();
    const endISO = end.toISOString();
    navigate(`/bookings/create?start=${startISO}&end=${endISO}`);
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    const style: React.CSSProperties = {
      backgroundColor: event.isOwn ? '#1976d2' : '#9e9e9e',
      borderRadius: '4px',
      opacity: 0.9,
      color: 'white',
      border: 'none',
      display: 'block',
    };
    return { style };
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Заголовок */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              📅 Booking Calendar
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View and manage bookings in calendar view
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/bookings/create')}
          >
            New Booking
          </Button>
        </Box>

        {/* Легенда */}
        <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
          <Chip 
            size="small" 
            sx={{ bgcolor: '#1976d2', color: 'white' }} 
            label="My Bookings" 
          />
          {isAdmin && (
            <Chip 
              size="small" 
              sx={{ bgcolor: '#9e9e9e', color: 'white' }} 
              label="Other Bookings" 
            />
          )}
        </Box>

        {/* Календарь */}
        <Paper elevation={3} sx={{ p: 2, height: 700 }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            views={['month', 'week', 'day', 'agenda']}
            view={currentView}
            onView={(view) => setCurrentView(view as 'month' | 'week' | 'day' | 'agenda')}
            date={currentDate}
            onNavigate={(date) => setCurrentDate(date)}
            selectable
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            eventPropGetter={eventStyleGetter}
            step={30}
            timeslots={2}
          />
        </Paper>
      </Box>

      {/* Диалог с деталями бронирования */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarMonth color="primary" />
            Booking Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="h6" gutterBottom>
                {selectedEvent.resourceName}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AccessTime color="action" fontSize="small" />
                <Typography variant="body2">
                  <strong>Start:</strong> {formatDateTime(selectedEvent.start.toISOString())}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <AccessTime color="action" fontSize="small" />
                <Typography variant="body2">
                  <strong>End:</strong> {formatDateTime(selectedEvent.end.toISOString())}
                </Typography>
              </Box>

              <Chip 
                size="small" 
                color={selectedEvent.isOwn ? 'primary' : 'default'}
                label={selectedEvent.isOwn ? 'Your booking' : "Other user's booking"} 
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
          {selectedEvent?.isOwn && (
            <Button 
              color="primary" 
              onClick={() => {
                navigate(`/bookings/edit/${selectedEvent.id}`);
                setDialogOpen(false);
              }}
            >
              Edit
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};