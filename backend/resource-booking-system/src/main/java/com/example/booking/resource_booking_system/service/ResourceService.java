package com.example.booking.resource_booking_system.service;

import com.example.booking.resource_booking_system.entity.Resource;
import com.example.booking.resource_booking_system.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    // --- Пользовательское исключение ---
    public static class ResourceNotFoundException extends RuntimeException {
        public ResourceNotFoundException(String message) {
            super(message);
        }
    }

    // --- C (Create) ---
    public Resource createResource(Resource resource) {
        return resourceRepository.save(resource);
    }

    // --- R (Read All with Pagination) ---
    // ВОССТАНОВЛЕНА ЛОГИКА ПАГИНАЦИИ
    public Page<Resource> getAllResources(Pageable pageable) {
        return resourceRepository.findAll(pageable);
    }

    // --- R (Read by ID) ---
    public Resource getResourceById(Long resourceId) {
        return resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with ID: " + resourceId));
    }

    // --- U (Update) ---
    @Transactional
    public Resource updateResource(Long resourceId, Resource updatedResource) {
        Resource existingResource = getResourceById(resourceId);

        // Обновление полей
        existingResource.setName(updatedResource.getName());
        existingResource.setDescription(updatedResource.getDescription());

        return resourceRepository.save(existingResource);
    }

    // --- D (Delete) ---
    @Transactional
    public void deleteResource(Long resourceId) {
        Resource existingResource = getResourceById(resourceId);
        resourceRepository.delete(existingResource);
    }


    public Page<Resource> searchResources(String query, Pageable pageable) {
        // ПРАВИЛЬНО - убери приведение типа:
        return resourceRepository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
                query, query, pageable);
    }
}