package com.example.booking.resource_booking_system.service;

import com.example.booking.resource_booking_system.dto.BookingRequest;
import com.example.booking.resource_booking_system.dto.BookingResponse;
import com.example.booking.resource_booking_system.entity.Booking;
import com.example.booking.resource_booking_system.entity.Resource;
import com.example.booking.resource_booking_system.entity.User;
import com.example.booking.resource_booking_system.repository.BookingRepository;
import com.example.booking.resource_booking_system.repository.ResourceRepository;
import com.example.booking.resource_booking_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page; // <-- Используем Page
import org.springframework.data.domain.Pageable; // <-- Используем Pageable
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;

    // --- Пользовательские исключения для обработки ошибок в ControllerAdvice ---
    public static class BookingConflictException extends RuntimeException {
        public BookingConflictException(String message) { super(message); }
    }

    public static class ResourceNotFoundException extends RuntimeException {
        public ResourceNotFoundException(String message) { super(message); }
    }

    public static class UnauthorizedOperationException extends RuntimeException {
        public UnauthorizedOperationException(String message) { super(message); }
    }

    // ------------------- Вспомогательные методы -------------------

    /** Маппинг сущности Booking в DTO BookingResponse */
    private BookingResponse mapToResponse(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .userId(booking.getUser().getId())
                .userEmail(booking.getUser().getEmail())
                .resourceId(booking.getResource().getId())
                .resourceName(booking.getResource().getName())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .bookingTime(booking.getBookingTime())
                .build();
    }

    /** Получение текущего аутентифицированного пользователя из контекста безопасности */
    private User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new IllegalStateException("The user is not authenticated or the security context is empty.");
        }

        String username;
        Object principal = authentication.getPrincipal();

        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else {
            username = principal.toString();
        }

        return userRepository.findByEmail(username)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user '" + username + "' not found in the database."));
    }

    /** Проверка на пересечение времени с существующими бронированиями */
    private void checkConflicts(Long resourceId, LocalDateTime start, LocalDateTime end, Long bookingIdToExclude) {
        // Вызываем 4-параметровый метод репозитория для надежной проверки
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                resourceId, start, end, bookingIdToExclude
        );
        if (!conflicts.isEmpty()) {
            throw new BookingConflictException("Resource is already booked during the requested time slot.");
        }
    }


    // ------------------- C (Create) -------------------

    @Transactional
    public BookingResponse createBooking(BookingRequest request) {
        User user = getCurrentAuthenticatedUser();
        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with ID: " + request.getResourceId()));

        // Валидация времени
        if (request.getStartTime().isAfter(request.getEndTime()) || request.getStartTime().isEqual(request.getEndTime())) {
            throw new IllegalArgumentException("Start time must be strictly before end time.");
        }

        // Проверка конфликтов (передаем null, т.к. это создание)
        checkConflicts(request.getResourceId(), request.getStartTime(), request.getEndTime(), null);

        Booking newBooking = new Booking();
        newBooking.setResource(resource);
        newBooking.setUser(user);
        newBooking.setStartTime(request.getStartTime());
        newBooking.setEndTime(request.getEndTime());

        Booking savedBooking = bookingRepository.save(newBooking);
        return mapToResponse(savedBooking); // Возвращаем DTO
    }

    // ------------------- R (Read) -------------------

    public BookingResponse getBookingById(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));
        return mapToResponse(booking); // Возвращаем DTO
    }

    /**
     * R (Read All with Pagination) - Для Администраторов.
     * Возвращает страницу всех бронирований.
     */
    @Transactional(readOnly = true)
    public Page<BookingResponse> getAllBookings(Pageable pageable) {
        // Получаем страницу сущностей и маппим ее в страницу DTO
        return bookingRepository.findAll(pageable)
                .map(this::mapToResponse);
    }

    /**
     * R (Read My with Pagination) - Для текущего Пользователя.
     * Возвращает страницу бронирований текущего пользователя.
     */
    @Transactional(readOnly = true)
    public Page<BookingResponse> getMyBookings(Pageable pageable) {
        User currentUser = getCurrentAuthenticatedUser();

        // Получаем страницу сущностей по ID пользователя и маппим ее в страницу DTO
        return bookingRepository.findByUserId(currentUser.getId(), pageable)
                .map(this::mapToResponse);
    }

    // ------------------- U (Update) -------------------

    // ... (Метод updateBooking остается без изменений) ...

    @Transactional
    public BookingResponse updateBooking(Long bookingId, BookingRequest request) {
        User currentUser = getCurrentAuthenticatedUser();

        // 1. Находим существующее бронирование
        Booking existingBooking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));

        // 2. Проверка авторизации: Только владелец может изменять бронирование
        if (!existingBooking.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedOperationException("You are not authorized to update this booking. Only the owner can do that.");
        }

        // 3. Проверяем и получаем ресурс
        Resource newResource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with ID: " + request.getResourceId()));

        // 4. Валидация времени
        if (request.getStartTime().isAfter(request.getEndTime()) || request.getStartTime().isEqual(request.getEndTime())) {
            throw new IllegalArgumentException("Start time must be strictly before end time.");
        }

        // 5. Проверяем на конфликт времени (ИСКЛЮЧАЯ само обновляемое бронирование)
        checkConflicts(request.getResourceId(), request.getStartTime(), request.getEndTime(), bookingId);

        // 6. Обновляем данные
        existingBooking.setResource(newResource);
        existingBooking.setStartTime(request.getStartTime());
        existingBooking.setEndTime(request.getEndTime());

        Booking updatedBooking = bookingRepository.save(existingBooking);
        return mapToResponse(updatedBooking); // Возвращаем DTO
    }


    // ------------------- D (Delete) -------------------

    // ... (Метод deleteBooking остается без изменений) ...

    @Transactional
    public void deleteBooking(Long bookingId) {
        User currentUser = getCurrentAuthenticatedUser();

        // 1. Находим существующее бронирование
        Booking existingBooking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));

        // 2. Проверка авторизации: Только владелец может удалять бронирование
        if (!existingBooking.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedOperationException("You are not authorized to delete this booking. Only the owner can do that.");
        }

        // 3. Удаляем
        bookingRepository.delete(existingBooking);
    }
}