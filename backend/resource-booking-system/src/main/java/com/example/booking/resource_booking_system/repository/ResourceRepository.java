package com.example.booking.resource_booking_system.repository;

import com.example.booking.resource_booking_system.entity.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
// ПРАВИЛЬНО:
import org.springframework.data.domain.Pageable;



public interface ResourceRepository extends JpaRepository<Resource, Long> {
    // В этом интерфейсе теперь есть методы: save(), findAll(), findById(), delete(), и т.д.
    Page<Resource> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            String name, String description, Pageable pageable);
}