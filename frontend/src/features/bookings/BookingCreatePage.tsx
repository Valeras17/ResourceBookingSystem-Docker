// src/features/bookings/BookingCreatePage.tsx

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import { CalendarMonth, ArrowBack } from '@mui/icons-material';
import { bookingsAPI } from '../../api/bookings.api';
import { resourcesAPI } from '../../api/resources.api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export const BookingCreatePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const preselectedResourceId = searchParams.get('resourceId');

  const [resourceId, setResourceId] = useState<string>(preselectedResourceId || '');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // Загрузка списка ресурсов для выбора
  const { data: resourcesData, isLoading: loadingResources } = useQuery({
    queryKey: ['resources'],
    queryFn: () => resourcesAPI.getAll(0, 100),
  });

  // Мутация для создания бронирования
  const createMutation = useMutation({
    mutationFn: bookingsAPI.create,
    onSuccess: () => {
      toast.success('Booking created successfully!');
      // Инвалидируем кеш бронирований чтобы список обновился
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['all-bookings'] });
      navigate('/bookings/my');
    },
    onError: () => {
      toast.error('Failed to create booking');
    },
  });

  // Устанавливаем дефолтные даты (завтра 10:00 - 12:00)
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const start = tomorrow.toISOString().slice(0, 16);
    tomorrow.setHours(12, 0, 0, 0);
    const end = tomorrow.toISOString().slice(0, 16);

    setStartTime(start);
    setEndTime(end);
  }, []);

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

    createMutation.mutate({
      resourceId: Number(resourceId),
      startTime: start.toISOString(),
      endTime: end.toISOString(),
    });
  };

  if (loadingResources) return <LoadingSpinner />;

  const resources = resourcesData?.data.content || [];

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Back
        </Button>

        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <CalendarMonth sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
            <Typography variant="h4" component="h1">
              Create Booking
            </Typography>
          </Box>

          <Alert severity="info" sx={{ mb: 3 }}>
            Select a resource and choose your desired time slot
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
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Creating...' : 'Create Booking'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};