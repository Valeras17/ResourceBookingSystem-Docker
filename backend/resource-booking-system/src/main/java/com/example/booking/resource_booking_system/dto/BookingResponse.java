// src/main/java/com/example/booking/resource_booking_system/dto/BookingResponse.java

package com.example.booking.resource_booking_system.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data // Генерирует геттеры, сеттеры, toString, equals и hashCode
@Builder // Позволяет создавать объекты через BookingResponse.builder()...build()
@AllArgsConstructor
@NoArgsConstructor
public class BookingResponse {

    private Long id;

    // --- Информация о пользователе ---
    private Long userId;
    private String userEmail;

    // --- Информация о ресурсе ---
    private Long resourceId;
    private String resourceName;

    // --- Информация о времени бронирования ---
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime bookingTime; // Время создания записи
}