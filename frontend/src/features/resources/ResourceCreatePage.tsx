// src/features/resources/ResourceCreatePage.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
} from '@mui/material';
import { Add, ArrowBack } from '@mui/icons-material';
import { resourcesAPI } from '../../api/resources.api';
import toast from 'react-hot-toast';

export const ResourceCreatePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Мутация для создания ресурса
  const createMutation = useMutation({
    mutationFn: resourcesAPI.create,
    onSuccess: () => {
      toast.success('Resource created successfully!');
      // Инвалидируем кеш ресурсов чтобы список обновился
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      navigate('/resources');
    },
    onError: () => {
      toast.error('Failed to create resource');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Resource name is required');
      return;
    }

    createMutation.mutate({
      name: name.trim(),
      description: description.trim(),
    });
  };

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
            <Add sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
            <Typography variant="h4" component="h1">
              Create New Resource
            </Typography>
          </Box>

          <Alert severity="info" sx={{ mb: 3 }}>
            Add a new resource that users can book (e.g., meeting rooms, equipment)
          </Alert>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Resource Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g., Conference Room A"
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
              placeholder="e.g., Large room with projector and whiteboard"
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
                disabled={createMutation.isPending}
                startIcon={<Add />}
              >
                {createMutation.isPending ? 'Creating...' : 'Create Resource'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};