// src/features/resources/ResourcesPage.tsx

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Pagination,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
} from '@mui/material';
import { MeetingRoom, Add, MoreVert, Edit, Delete, Search, Clear } from '@mui/icons-material';
import { resourcesAPI } from '../../api/resources.api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export const ResourcesPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const pageSize = 12;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedResourceId, setSelectedResourceId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Загрузка ресурсов с пагинацией и поиском
  const { data, isLoading } = useQuery({
    queryKey: ['resources', page, searchQuery],
    queryFn: () => 
      searchQuery.trim() 
        ? resourcesAPI.search(searchQuery.trim(), page, pageSize)
        : resourcesAPI.getAll(page, pageSize),
  });

  // Мутация для удаления
  const deleteMutation = useMutation({
    mutationFn: resourcesAPI.delete,
    onSuccess: () => {
      toast.success('Resource deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      setDeleteDialogOpen(false);
      setSelectedResourceId(null);
    },
    onError: () => {
      toast.error('Failed to delete resource');
    },
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, resourceId: number) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedResourceId(resourceId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    if (selectedResourceId) {
      navigate(`/resources/edit/${selectedResourceId}`);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = () => {
    if (selectedResourceId) {
      deleteMutation.mutate(selectedResourceId);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedResourceId(null);
  };

  const handleBookResource = (resourceId: number) => {
    navigate(`/bookings/create?resourceId=${resourceId}`);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setPage(0); // Сбрасываем на первую страницу
  };

  // Убираем клиентскую фильтрацию - теперь всё на сервере
  const resources = data?.data.content || [];

  if (isLoading) return <LoadingSpinner />;

  const totalPages = data?.data.totalPages || 0;

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Заголовок */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
         <Box>
  <Typography 
  variant="h4" 
  component="h1" 
  gutterBottom 
 
>
  📦 Available Resources
</Typography>

<Typography variant="body1">
  Browse and book available resources
</Typography>
</Box>
          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/resources/create')}
            >
              Add Resource
            </Button>
          )}
        </Box>

        {/* Поиск */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search resources by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClearSearch}>
                    <Clear />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Результаты поиска */}
        {searchQuery && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Found {data?.data.totalElements || 0} resource(s) matching "{searchQuery}"
            </Typography>
          </Box>
        )}

        {/* Список ресурсов */}
        {resources.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <MeetingRoom sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {searchQuery ? 'No resources found' : 'No resources available'}
            </Typography>
            {searchQuery && (
              <Button onClick={handleClearSearch} sx={{ mt: 2 }}>
                Clear search
              </Button>
            )}
          </Box>
        ) : (
          <>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                },
                gap: 3,
              }}
            >
              {resources.map((resource) => (
                <Box key={resource.id}>
                  <Card
                    elevation={2}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                          <MeetingRoom sx={{ fontSize: 32, color: 'primary.main', mr: 1 }} />
                          <Typography variant="h6" component="h2">
                            {resource.name}
                          </Typography>
                        </Box>
                        {isAdmin && (
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, resource.id)}
                          >
                            <MoreVert />
                          </IconButton>
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {resource.description || 'No description available'}
                      </Typography>
                      <Chip label={`ID: ${resource.id}`} size="small" variant="outlined" />
                    </CardContent>
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => handleBookResource(resource.id)}
                      >
                        Book Now
                      </Button>
                    </CardActions>
                  </Card>
                </Box>
              ))}
            </Box>

            {/* Пагинация (скрываем при поиске) */}
            {!searchQuery && totalPages > 1 && (
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

      {/* Меню действий для админа */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <Edit sx={{ mr: 1 }} fontSize="small" />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} fontSize="small" />
          Delete
        </MenuItem>
      </Menu>

      {/* Диалог подтверждения удаления */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Resource"
        message="Are you sure you want to delete this resource? All associated bookings will also be affected."
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
      />
    </Container>
  );
};