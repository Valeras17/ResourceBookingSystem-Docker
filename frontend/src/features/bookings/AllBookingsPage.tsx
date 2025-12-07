// src/features/bookings/AllBookingsPage.tsx

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Chip,
  Pagination,
  Button,
  Alert,
} from '@mui/material';
import { Delete, CalendarMonth, AccessTime, Person } from '@mui/icons-material';
import { bookingsAPI } from '../../api/bookings.api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { formatDateTime } from '../../utils/dateUtils';
import toast from 'react-hot-toast';

export const AllBookingsPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);

  // Загрузка всех бронирований (только для админа)
  const { data, isLoading } = useQuery({
    queryKey: ['all-bookings', page],
    queryFn: () => bookingsAPI.getAllBookings(page, 20),
  });

  // Мутация для удаления
  const deleteMutation = useMutation({
    mutationFn: bookingsAPI.delete,
    onSuccess: () => {
      toast.success('Booking deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['all-bookings'] });
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
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            👥 All Bookings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage all system bookings (Admin only)
          </Typography>
        </Box>

        <Alert severity="warning" sx={{ mb: 3 }}>
          You are viewing all bookings in the system. Handle with care.
        </Alert>

        {/* Список бронирований */}
        {bookings.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CalendarMonth sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No bookings in the system
            </Typography>
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
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip
                            label={`Booking ID: ${booking.id}`}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            label={`Resource ID: ${booking.resourceId}`}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 3, mt: 2, flexWrap: 'wrap' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person color="action" />
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            User
                          </Typography>
                          <Typography variant="body2">
                            {booking.userEmail}
                          </Typography>
                        </Box>
                      </Box>

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
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Confirm Deletion"
        message="Are you sure you want to delete this booking? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
      />
    </Container>
  );
};