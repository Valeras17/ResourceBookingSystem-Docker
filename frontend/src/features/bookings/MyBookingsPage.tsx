// src/features/bookings/MyBookingsPage.tsx

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import { Add, Delete, Edit, CalendarMonth, AccessTime } from '@mui/icons-material';
import { bookingsAPI } from '../../api/bookings.api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDateTime } from '../../utils/dateUtils';
import toast from 'react-hot-toast';

export const MyBookingsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);

  // Загрузка моих бронирований
  const { data, isLoading } = useQuery({
    queryKey: ['my-bookings', page],
    queryFn: () => bookingsAPI.getMyBookings(page, 10),
  });

  // Мутация для удаления
  const deleteMutation = useMutation({
    mutationFn: bookingsAPI.delete,
    onSuccess: () => {
      toast.success('Booking deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      setDeleteDialogOpen(false);
    },
    onError: () => {
      toast.error('Failed to delete booking');
    },
  });

  const handleDeleteClick = (id: number) => {
    setSelectedBookingId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedBookingId) {
      deleteMutation.mutate(selectedBookingId);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  const bookings = data?.data.content || [];
  const totalPages = data?.data.totalPages || 0;

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Заголовок */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              📅 My Bookings
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your resource bookings
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

        {/* Список бронирований */}
        {bookings.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CalendarMonth sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No bookings yet
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/bookings/create')}
              sx={{ mt: 2 }}
            >
              Create your first booking
            </Button>
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {bookings.map((booking) => (
                <Card key={booking.id} elevation={2}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" component="h2" gutterBottom>
                          {booking.resourceName}
                        </Typography>
                        <Chip
                          label={`ID: ${booking.id}`}
                          size="small"
                          variant="outlined"
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          label={`Resource ID: ${booking.resourceId}`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarMonth color="action" />
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Start
                          </Typography>
                          <Typography variant="body2">
                            {formatDateTime(booking.startTime)}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTime color="action" />
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            End
                          </Typography>
                          <Typography variant="body2">
                            {formatDateTime(booking.endTime)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => navigate(`/bookings/edit/${booking.id}`)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => handleDeleteClick(booking.id)}
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </Box>

            {/* Пагинация */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={page + 1}
                  onChange={(_, value) => setPage(value - 1)}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Диалог подтверждения удаления */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this booking? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};