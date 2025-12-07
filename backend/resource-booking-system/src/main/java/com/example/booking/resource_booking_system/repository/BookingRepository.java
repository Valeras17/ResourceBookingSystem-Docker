package com.example.booking.resource_booking_system.repository;

import com.example.booking.resource_booking_system.entity.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    /**
     * Поиск бронирований текущего пользователя с пагинацией.
     */
    Page<Booking> findByUserId(Long userId, Pageable pageable);

    /**
     * Запрос для поиска пересекающихся бронирований.
     * Критерии конфликта (пересечения):
     * 1. ID ресурса совпадает.
     * 2. Исключается текущее бронирование (если это обновление).
     * 3. Временные промежутки пересекаются.
     * - [A, B] и [C, D] пересекаются, если A < D и B > C.
     */
    @Query("SELECT b FROM Booking b " +
            "WHERE b.resource.id = :resourceId " +
            // Исключаем текущее бронирование, если ID не null (для PUT)
            "AND (:bookingIdToExclude IS NULL OR b.id != :bookingIdToExclude) " +
            // Проверка на пересечение времени: старт нового ДО конца старого И конец нового ПОСЛЕ старта старого
            "AND b.startTime < :end " +
            "AND b.endTime > :start")
    List<Booking> findConflictingBookings(
            @Param("resourceId") Long resourceId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("bookingIdToExclude") Long bookingIdToExclude);
}