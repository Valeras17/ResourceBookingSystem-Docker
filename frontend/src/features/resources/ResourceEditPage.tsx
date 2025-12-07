// src/features/resources/ResourceEditPage.tsx

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
  Alert,
} from '@mui/material';
import { Edit, ArrowBack } from '@mui/icons-material';
import { resourcesAPI } from '../../api/resources.api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export const ResourceEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Загрузка данных ресурса
  const { data, isLoading } = useQuery({
    queryKey: ['resource', id],
    queryFn: () => resourcesAPI.getById(Number(id)),
    enabled: !!id,
  });

  // Заполняем форму при загрузке данных
  useEffect(() => {
    if (data?.data) {
      setName(data.data.name);
      setDescription(data.data.description || '');
    }
  }, [data]);

  // Мутация для обновления ресурса
  const updateMutation = useMutation({
    mutationFn: (data: { name: string; description: string }) =>
      resourcesAPI.update(Number(id), data),
    onSuccess: () => {
      toast.success('Resource updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      queryClient.invalidateQueries({ queryKey: ['resource', id] });
      navigate('/resources');
    },
    onError: () => {
      toast.error('Failed to update resource');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Resource name is required');
      return;
    }

    updateMutation.mutate({
      name: name.trim(),
      description: description.trim(),
    });
  };

  if (isLoading) return <LoadingSpinner />;

  if (!data?.data) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">Resource not found</Alert>
          <Button onClick={() => navigate('/resources')} sx={{ mt: 2 }}>
            Back to Resources
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/resources')}
          sx={{ mb: 2 }}
        >
          Back to Resources
        </Button>

        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Edit sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
            <Typography variant="h4" component="h1">
              Edit Resource
            </Typography>
          </Box>

          <Alert severity="info" sx={{ mb: 3 }}>
            Update the resource information below
          </Alert>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Resource Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              sx={{ mb: 3 }}
              helperText="Enter a unique name for this resource"
            />

            <TextField
              fullWidth
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={4}
              sx={{ mb: 3 }}
              helperText="Provide details about the resource (optional)"
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate('/resources')}
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
                {updateMutation.isPending ? 'Updating...' : 'Update Resource'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};