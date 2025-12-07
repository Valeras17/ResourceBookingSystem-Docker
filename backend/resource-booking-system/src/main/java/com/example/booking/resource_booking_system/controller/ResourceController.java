package com.example.booking.resource_booking_system.controller;

import com.example.booking.resource_booking_system.entity.Resource;
import com.example.booking.resource_booking_system.service.ResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // <-- НОВЫЙ ИМПОРТ
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    // POST /api/resources (C - Create)
    // ТОЛЬКО АДМИНИСТРАТОР
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Resource> createResource(@RequestBody Resource resource) {
        Resource createdResource = resourceService.createResource(resource);
        return new ResponseEntity<>(createdResource, HttpStatus.CREATED);
    }

    // GET /api/resources (R - Read All with Pagination)
    // ДОСТУПНО ВСЕМ (даже не аутентифицированным, если разрешено в SecurityConfig)
    @GetMapping
    public ResponseEntity<Page<Resource>> getAllResources(
            @PageableDefault(size = 20, sort = "id") Pageable pageable) {

        Page<Resource> resourcesPage = resourceService.getAllResources(pageable);
        return ResponseEntity.ok(resourcesPage);
    }

    // ⬇️ ЭТОТ МЕТОД ДОЛЖЕН БЫТЬ ВЫШЕ ЧЕМ /{id} ⬇️
    // GET /api/resources/search?query=meeting
    @GetMapping("/search")
    public ResponseEntity<Page<Resource>> searchResources(
            @RequestParam String query,
            @PageableDefault(size = 20, sort = "id") Pageable pageable) {
        Page<Resource> resources = resourceService.searchResources(query, pageable);
        return ResponseEntity.ok(resources);
    }

    // GET /api/resources/{id} (R - Read by ID)
    // ДОСТУПНО ВСЕМ
    // GET /api/resources/{id} - ДОЛЖЕН БЫТЬ ПОСЛЕ /search
    @GetMapping("/{id}")
    public ResponseEntity<?> getResourceById(@PathVariable Long id) {
        try {
            Resource resource = resourceService.getResourceById(id);
            return ResponseEntity.ok(resource);
        } catch (ResourceService.ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // PUT /api/resources/{id} (U - Update)
    // ТОЛЬКО АДМИНИСТРАТОР
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateResource(@PathVariable Long id, @RequestBody Resource resourceDetails) {
        try {
            Resource updatedResource = resourceService.updateResource(id, resourceDetails);
            return ResponseEntity.ok(updatedResource);
        } catch (ResourceService.ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // DELETE /api/resources/{id} (D - Delete)
    // ТОЛЬКО АДМИНИСТРАТОР
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteResource(@PathVariable Long id) {
        try {
            resourceService.deleteResource(id);
            return ResponseEntity.noContent().build();
        } catch (ResourceService.ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }


}