package com.example.booking.resource_booking_system.repository;

import com.example.booking.resource_booking_system.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional; // Добавляем импорт

public interface UserRepository extends JpaRepository<User, Long> {

    // Метод, необходимый Spring Security для поиска пользователя по логину (email)
    Optional<User> findByEmail(String email);
}