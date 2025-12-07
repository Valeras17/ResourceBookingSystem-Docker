package com.example.booking.resource_booking_system.booking;

import com.example.booking.resource_booking_system.dto.BookingRequest;
import com.example.booking.resource_booking_system.dto.BookingResponse;
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
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Set;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class BookingControllerIntegrationTest {

    private static final String API_URL = "/api/bookings";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    private Long testResourceId;

    @BeforeEach
    void setup() {
        // 1. Инициализация Ролей
        Role roleUser = roleRepository.findByName(ERole.ROLE_USER)
                .orElseGet(() -> {
                    Role r = new Role();
                    r.setName(ERole.ROLE_USER);
                    return roleRepository.save(r);
                });

        Role roleAdmin = roleRepository.findByName(ERole.ROLE_ADMIN)
                .orElseGet(() -> {
                    Role r = new Role();
                    r.setName(ERole.ROLE_ADMIN);
                    return roleRepository.save(r);
                });

        // 2. Создание Тестовых Пользователей
        createTestUser("owner@example.com", roleUser);
        createTestUser("stranger@example.com", roleUser);
        createTestUser("other@example.com", roleUser);
        createTestUser("admin@example.com", roleAdmin);
        createTestUser("test.user@example.com", roleUser);

        // 3. Создание Тестового Ресурса
        Resource resource = new Resource();
        resource.setName("Test Room " + System.currentTimeMillis());
        resource.setDescription("Integration Test Room");
        testResourceId = resourceRepository.save(resource).getId();
    }

    private void createTestUser(String email, Role role) {
        if (userRepository.findByEmail(email).isEmpty()) {
            User user = User.builder()
                    .email(email)
                    .password("password123")
                    .firstName("Test")
                    .lastName("User")
                    .roles(Set.of(role))
                    .build();
            userRepository.save(user);
        }
    }

    private BookingRequest createValidBookingRequest(LocalDateTime start, LocalDateTime end) {
        BookingRequest request = new BookingRequest();
        request.setResourceId(testResourceId);
        request.setStartTime(start);
        request.setEndTime(end);
        return request;
    }

    private Long createBookingAndGetId(String userEmail, BookingRequest request) throws Exception {
        MvcResult result = mockMvc.perform(post(API_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors
                                .user(userEmail).roles("USER")))
                .andExpect(status().isCreated())
                .andReturn();

        String responseJson = result.getResponse().getContentAsString();
        BookingResponse response = objectMapper.readValue(responseJson, BookingResponse.class);
        return response.getId();
    }

    // ================= ТЕСТЫ =================

    @Test
    @WithMockUser(username = "test.user@example.com", roles = {"USER"})
    void createBooking_success() throws Exception {
        LocalDateTime start = LocalDateTime.now().plusDays(10);
        LocalDateTime end = start.plusHours(2);
        BookingRequest request = createValidBookingRequest(start, end);

        mockMvc.perform(post(API_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.resourceId").value(testResourceId))
                .andExpect(jsonPath("$.userEmail").value("test.user@example.com"));
    }

    @Test
    @WithMockUser(username = "owner@example.com", roles = {"USER"})
    void createBooking_conflict_returns409_JSON() throws Exception {
        LocalDateTime start = LocalDateTime.now().plusDays(1).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime end = start.plusHours(2);

        createBookingAndGetId("other@example.com", createValidBookingRequest(start, end));

        BookingRequest conflictRequest = createValidBookingRequest(start.plusHours(1), start.plusHours(3));

        mockMvc.perform(post(API_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(conflictRequest)))
                .andExpect(status().isConflict())
                // ПРОВЕРЯЕМ JSON ПОЛЕ message
                .andExpect(jsonPath("$.message").value("Resource is already booked during the requested time slot."));
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void getAllBookings_byAdmin_success() throws Exception {
        mockMvc.perform(get(API_URL))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @WithMockUser(username = "test.user@example.com", roles = {"USER"})
    void getAllBookings_byUser_returns403() throws Exception {
        mockMvc.perform(get(API_URL))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "owner@example.com", roles = {"USER"})
    void getMyBookings_success() throws Exception {
        LocalDateTime start = LocalDateTime.now().plusDays(2).withMinute(0).withSecond(0).withNano(0);
        createBookingAndGetId("owner@example.com", createValidBookingRequest(start, start.plusHours(1)));

        mockMvc.perform(get(API_URL + "/my"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[?(@.userEmail == 'owner@example.com')]").exists());
    }

    @Test
    @WithMockUser(username = "owner@example.com", roles = {"USER"})
    void updateBooking_byOwner_success() throws Exception {
        LocalDateTime start = LocalDateTime.now().plusDays(3);
        Long bookingId = createBookingAndGetId("owner@example.com", createValidBookingRequest(start, start.plusHours(1)));

        LocalDateTime newStart = start.plusHours(5);
        BookingRequest updateRequest = createValidBookingRequest(newStart, newStart.plusHours(1));

        mockMvc.perform(put(API_URL + "/{id}", bookingId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.startTime").exists());
    }

    @Test
    @WithMockUser(username = "stranger@example.com", roles = {"USER"})
    void updateBooking_byStranger_returns403_JSON() throws Exception {
        LocalDateTime start = LocalDateTime.now().plusDays(4);
        Long bookingId = createBookingAndGetId("owner@example.com", createValidBookingRequest(start, start.plusHours(1)));

        BookingRequest updateRequest = createValidBookingRequest(start.plusHours(1), start.plusHours(2));

        mockMvc.perform(put(API_URL + "/{id}", bookingId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isForbidden())
                // ПРОВЕРЯЕМ JSON ПОЛЕ message
                .andExpect(jsonPath("$.message").value("You are not authorized to update this booking. Only the owner can do that."));
    }

    @Test
    @WithMockUser(username = "owner@example.com", roles = {"USER"})
    void updateBooking_conflict_returns409_JSON() throws Exception {
        LocalDateTime start1 = LocalDateTime.now().plusDays(5).withMinute(0).withSecond(0).withNano(0);

        createBookingAndGetId("other@example.com", createValidBookingRequest(start1, start1.plusHours(2)));

        LocalDateTime start2 = start1.plusHours(3);
        Long bookingToUpdateId = createBookingAndGetId("owner@example.com", createValidBookingRequest(start2, start2.plusHours(1)));

        BookingRequest conflictUpdateRequest = createValidBookingRequest(start1, start1.plusHours(2));

        mockMvc.perform(put(API_URL + "/{id}", bookingToUpdateId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(conflictUpdateRequest)))
                .andExpect(status().isConflict())
                // ПРОВЕРЯЕМ JSON ПОЛЕ message
                .andExpect(jsonPath("$.message").value("Resource is already booked during the requested time slot."));
    }

    @Test
    @WithMockUser(username = "owner@example.com", roles = {"USER"})
    void deleteBooking_byOwner_success() throws Exception {
        LocalDateTime start = LocalDateTime.now().plusDays(6);
        Long bookingId = createBookingAndGetId("owner@example.com", createValidBookingRequest(start, start.plusHours(1)));

        mockMvc.perform(delete(API_URL + "/{id}", bookingId))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(username = "stranger@example.com", roles = {"USER"})
    void deleteBooking_byStranger_returns403_JSON() throws Exception {
        LocalDateTime start = LocalDateTime.now().plusDays(7);
        Long bookingId = createBookingAndGetId("owner@example.com", createValidBookingRequest(start, start.plusHours(1)));

        mockMvc.perform(delete(API_URL + "/{id}", bookingId))
                .andExpect(status().isForbidden())
                // ПРОВЕРЯЕМ JSON ПОЛЕ message
                .andExpect(jsonPath("$.message").value("You are not authorized to delete this booking. Only the owner can do that."));
    }
}