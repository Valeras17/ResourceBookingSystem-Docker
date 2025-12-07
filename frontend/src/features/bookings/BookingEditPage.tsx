// src/features/bookings/BookingEditPage.tsx

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  Alert,
} from '@mui/material';
import { Edit, ArrowBack } from '@mui/icons-material';
import { bookingsAPI } from '../../api/bookings.api';
import { resourcesAPI } from '../../api/resources.api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export const BookingEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [resourceId, setResourceId] = useState<string>('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // Загрузка данных бронирования
  const { data: bookingData, isLoading: loadingBooking } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingsAPI.getById(Number(id)),
    enabled: !!id,
  });

  // Загрузка списка ресурсов
  const { data: resourcesData, isLoading: loadingResources } = useQuery({
    queryKey: ['resources'],
    queryFn: () => resourcesAPI.getAll(0, 100),
  });

  // Заполняем форму при загрузке данных
  useEffect(() => {
    if (bookingData?.data) {
      const booking = bookingData.data;
      setResourceId(String(booking.resourceId));
      setStartTime(new Date(booking.startTime).toISOString().slice(0, 16));
      setEndTime(new Date(booking.endTime).toISOString().slice(0, 16));
    }
  }, [bookingData]);

  // Мутация для обновления бронирования
  const updateMutation = useMutation({
    mutationFn: (data: { resourceId: number; startTime: string; endTime: string }) =>
      bookingsAPI.update(Number(id), data),
    onSuccess: () => {
      toast.success('Booking updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['all-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
      navigate('/bookings/my');
    },
    onError: () => {
      toast.error('Failed to update booking');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!resourceId || !startTime || !endTime) {
      toast.error('Please fill all fields');
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      toast.error('End time must be after start time');
      return;
    }

    if (start < new Date()) {
      toast.error('Start time must be in the future');
      return;
    }

    updateMutation.mutate({
      resourceId: Number(resourceId),
      startTime: start.toISOString(),
      endTime: end.toISOString(),
    });
  };

  if (loadingBooking || loadingResources) return <LoadingSpinner />;

  if (!bookingData?.data) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">Booking not found</Alert>
          <Button onClick={() => navigate('/bookings/my')} sx={{ mt: 2 }}>
            Back to My Bookings
          </Button>
        </Box>
      </Container>
    );
  }

  const resources = resourcesData?.data.content || [];

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/bookings/my')}
          sx={{ mb: 2 }}
        >
          Back to My Bookings
        </Button>

        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Edit sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
            <Typography variant="h4" component="h1">
              Edit Booking
            </Typography>
          </Box>

          <Alert severity="info" sx={{ mb: 3 }}>
            Update your booking details below
          </Alert>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              select
              fullWidth
              label="Resource"
              value={resourceId}
              onChange={(e) => setResourceId(e.target.value)}
              required
              sx={{ mb: 3 }}
            >
              {resources.map((resource) => (
                <MenuItem key={resource.id} value={resource.id}>
                  {resource.name} - {resource.description}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Start Time"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="End Time"
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 3 }}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate('/bookings/my')}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={updateMutation.isPending}
                startIcon={<Edit />}
              >
                {updateMutation.isPending ? 'Updating...' : 'Update Booking'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};