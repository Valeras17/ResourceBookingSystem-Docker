// src/main/java/com/example/booking/resource_booking_system/repository/RoleRepository.java

package com.example.booking.resource_booking_system.repository;

import com.example.booking.resource_booking_system.entity.ERole;
import com.example.booking.resource_booking_system.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(ERole name);
}