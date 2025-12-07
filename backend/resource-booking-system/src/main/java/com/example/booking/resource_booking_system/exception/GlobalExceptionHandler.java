package com.example.booking.resource_booking_system.exception;

import com.example.booking.resource_booking_system.service.BookingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

/**
 * Централизованный обработчик ошибок для всего приложения.
 * Перехватывает исключения и возвращает форматированные HTTP-ответы.
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    // Структура для возврата ошибок валидации
    public static class ValidationErrorResponse {
        private String error;
        private String message;
        private Map<String, String> errors;

        public ValidationErrorResponse(String error, String message, Map<String, String> errors) {
            this.error = error;
            this.message = message;
            this.errors = errors;
        }

        public String getError() { return error; }
        public String getMessage() { return message; }
        public Map<String, String> getErrors() { return errors; }
    }

    /**
     * Обработка ошибок валидации DTO (@Valid)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        ValidationErrorResponse response = new ValidationErrorResponse(
                "Bad Request",
                "Validation failed for one or more fields",
                errors
        );

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    /**
     * Обработка ошибок, связанных с бизнес-логикой (Resource/Booking Not Found)
     */
    @ExceptionHandler({
            BookingService.ResourceNotFoundException.class,
            BookingService.UnauthorizedOperationException.class,
            BookingService.BookingConflictException.class
    })
    public ResponseEntity<String> handleServiceExceptions(RuntimeException ex) {
        HttpStatus status;
        if (ex instanceof BookingService.ResourceNotFoundException) {
            status = HttpStatus.NOT_FOUND; // 404
        } else if (ex instanceof BookingService.UnauthorizedOperationException) {
            status = HttpStatus.FORBIDDEN; // 403
        } else if (ex instanceof BookingService.BookingConflictException) {
            status = HttpStatus.CONFLICT; // 409
        } else {
            status = HttpStatus.INTERNAL_SERVER_ERROR; // 500
        }

        return new ResponseEntity<>(ex.getMessage(), status);
    }

    /**
     * Обработка всех остальных исключений (Internal Server Error)
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleAllExceptions(Exception ex) {
        // Логируем ошибку, чтобы увидеть ее в консоли
        ex.printStackTrace();
        return new ResponseEntity<>("An unexpected error occurred: " + ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}