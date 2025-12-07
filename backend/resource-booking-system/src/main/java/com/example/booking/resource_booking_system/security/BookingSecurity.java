package com.example.booking.resource_booking_system.security;

import com.example.booking.resource_booking_system.entity.Booking;
import com.example.booking.resource_booking_system.repository.BookingRepository;
import com.example.booking.resource_booking_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

/**
 * Компонент безопасности для проверки прав доступа к сущности Booking
 * Используется в @PreAuthorize с помощью SpEL: @bookingSecurity.isOwner(#id)
 */
@Component("bookingSecurity") // Имя бина для SpEL
@RequiredArgsConstructor
public class BookingSecurity {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    /**
     * Проверяет, является ли текущий аутентифицированный пользователь владельцем бронирования.
     * @param bookingId ID бронирования для проверки.
     * @return true, если пользователь - владелец, false - в противном случае.
     */
    public boolean isOwner(Long bookingId) {
        // 1. Получаем объект Authentication
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return false; // Нет аутентификации
        }

        // 2. Получаем email (username) текущего пользователя
        String userEmail;
        Object principal = authentication.getPrincipal();

        if (principal instanceof UserDetails) {
            userEmail = ((UserDetails) principal).getUsername();
        } else {
            userEmail = principal.toString();
        }

        // 3. Ищем ID пользователя в БД
        Long currentUserId = userRepository.findByEmail(userEmail)
                .map(com.example.booking.resource_booking_system.entity.User::getId)
                .orElse(null);

        if (currentUserId == null) {
            return false;
        }

        // 4. Ищем бронирование и проверяем совпадение ID владельца
        return bookingRepository.findById(bookingId)
                .map(Booking::getUser)
                .map(com.example.booking.resource_booking_system.entity.User::getId)
                .map(ownerId -> ownerId.equals(currentUserId))
                .orElse(false); // Бронирование не найдено
    }
}