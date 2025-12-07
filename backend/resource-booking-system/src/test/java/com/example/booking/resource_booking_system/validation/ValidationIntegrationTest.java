package com.example.booking.resource_booking_system.validation;

import com.example.booking.resource_booking_system.dto.BookingRequest;
import com.example.booking.resource_booking_system.dto.RegisterRequest;
import com.example.booking.resource_booking_system.entity.ERole;
import com.example.booking.resource_booking_system.entity.Resource;
import com.example.booking.resource_booking_system.entity.Role;
import com.example.booking.resource_booking_system.entity.User;
import com.example.booking.resource_booking_system.repository.ResourceRepository;
import com.example.booking.resource_booking_system.repository.RoleRepository;
import com.example.booking.resource_booking_system.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Set;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Интеграционные тесты для проверки валидации DTO (@Valid и GlobalExceptionHandler).
 * Проверяет, что API возвращает 400 Bad Request с корректным JSON-списком ошибок.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class ValidationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    private Long testResourceId;

    @BeforeEach
    void setup() {
        // 1. Убедимся, что роль USER существует
        Role userRole = roleRepository.findByName(ERole.ROLE_USER).orElseGet(() -> {
            Role r = new Role();
            r.setName(ERole.ROLE_USER);
            return roleRepository.save(r);
        });

        // 2. Создаем тестового пользователя
        userRepository.findByEmail("test.user@example.com").orElseGet(() -> {
            User u = User.builder()
                    .email("test.user@example.com")
                    .password("password123")
                    .firstName("Test")
                    .lastName("User")
                    .roles(Set.of(userRole))
                    .build();
            return userRepository.save(u);
        });

        // 3. Создаем / берём тестовый ресурс (id не хардкодим)
        Resource res = resourceRepository.findAll().stream().findFirst().orElseGet(() -> {
            Resource testResource = Resource.builder()
                    .name("Conference Room A")
                    .description("Test resource for validation")
                    .build();
            return resourceRepository.save(testResource);
        });
        testResourceId = res.getId();
    }

    // ========================================================================
    // ТЕСТЫ ВАЛИДАЦИИ REGISTER/AUTHENTICATION (AuthController)
    // ========================================================================

    /**
     * Тест #1: Пустое имя (firstName = "")
     * Ожидается срабатывание @NotBlank с сообщением "First name is required"
     */
    @Test
    void registerUser_withEmptyFirstName_returns400() throws Exception {
        RegisterRequest invalidRequest = RegisterRequest.builder()
                .firstName("") // Пустое - сработает @NotBlank
                .lastName("Doe")
                .email("invalid-email")
                .password("short")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.errors.firstName")
                        .value("First name is required")) // ИСПРАВЛЕНО
                .andExpect(jsonPath("$.errors.email")
                        .value("Email format is incorrect"))
                .andExpect(jsonPath("$.errors.password")
                        .value("Password must be at least 6 characters long"));
    }

    /**
     * Тест #2: Короткое имя (firstName = "A")
     * Ожидается срабатывание @Size с сообщением "First name must be between 2 and 50 characters"
     */
    @Test
    void registerUser_withShortFirstName_returns400() throws Exception {
        RegisterRequest invalidRequest = RegisterRequest.builder()
                .firstName("A") // 1 символ - пройдет @NotBlank, но не пройдет @Size
                .lastName("Doe")
                .email("valid@example.com")
                .password("validpassword")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.errors.firstName")
                        .value("First name must be between 2 and 50 characters"));
    }

    /**
     * Тест #3: Все поля невалидны (комплексная проверка)
     */
    @Test
    void registerUser_withMultipleInvalidFields_returns400() throws Exception {
        RegisterRequest invalidRequest = RegisterRequest.builder()
                .firstName("A") // Короткое имя
                .lastName("B") // Короткая фамилия
                .email("not-an-email") // Неверный формат email
                .password("123") // Короткий пароль
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.errors.firstName").exists())
                .andExpect(jsonPath("$.errors.lastName").exists())
                .andExpect(jsonPath("$.errors.email").exists())
                .andExpect(jsonPath("$.errors.password").exists());
    }

    // ========================================================================
    // ТЕСТЫ ВАЛИДАЦИИ BOOKING (BookingController)
    // ========================================================================

    /**
     * Тест #4: Время бронирования в прошлом
     */
    @Test
    @WithMockUser(username = "test.user@example.com", roles = {"USER"})
    void createBooking_withPastTime_returns400() throws Exception {
        // Устанавливаем время гарантированно в прошлом
        LocalDateTime pastStart = LocalDateTime.now().minusDays(2);
        LocalDateTime pastEnd = LocalDateTime.now().minusDays(1);

        BookingRequest invalidRequest = new BookingRequest();
        invalidRequest.setResourceId(testResourceId);
        invalidRequest.setStartTime(pastStart);
        invalidRequest.setEndTime(pastEnd);

        mockMvc.perform(post("/api/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.startTime")
                        .value("Start time must be in the present or future"))
                .andExpect(jsonPath("$.errors.endTime")
                        .value("End time must be in the future"));
    }

    /**
     * Тест #5: Null значения в обязательных полях
     */
    @Test
    @WithMockUser(username = "test.user@example.com", roles = {"USER"})
    void createBooking_withNullFields_returns400() throws Exception {
        BookingRequest invalidRequest = new BookingRequest();
        // Все поля null

        mockMvc.perform(post("/api/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.resourceId")
                        .value("Resource ID is required"))
                .andExpect(jsonPath("$.errors.startTime")
                        .value("Start time is required"))
                .andExpect(jsonPath("$.errors.endTime")
                        .value("End time is required"));
    }

    /**
     * Тест #6: Валидная регистрация (позитивный тест)
     */
    @Test
    void registerUser_withValidData_returns200() throws Exception {
        RegisterRequest validRequest = RegisterRequest.builder()
                .firstName("John")
                .lastName("Doe")
                .email("newuser@example.com")
                .password("securepassword123")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());
    }
}