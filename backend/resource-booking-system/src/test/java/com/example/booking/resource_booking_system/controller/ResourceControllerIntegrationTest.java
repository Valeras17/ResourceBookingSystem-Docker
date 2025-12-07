package com.example.booking.resource_booking_system.controller;

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

import java.util.Set;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Интеграционные тесты для ResourceController.
 * Проверяют CRUD операции и ролевую безопасность.
 * Использует @WithMockUser для симуляции аутентифицированных пользователей.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional // Откатывает все изменения в БД после каждого теста
public class ResourceControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    // Репозитории для создания тестовых данных напрямую в БД
    @Autowired private UserRepository userRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private ResourceRepository resourceRepository;

    private Resource testResource;
    private static final String RESOURCE_API = "/api/resources";

    /**
     * Настройка тестового окружения: создание ролей, пользователей (Admin и User) и тестового ресурса.
     * Выполняется перед каждым тестом.
     */
    @BeforeEach
    void setup() {
        // Гарантируем, что роли существуют
        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN).orElseGet(() -> {
            Role r = new Role(); r.setName(ERole.ROLE_ADMIN); return roleRepository.save(r);
        });
        Role userRole = roleRepository.findByName(ERole.ROLE_USER).orElseGet(() -> {
            Role r = new Role(); r.setName(ERole.ROLE_USER); return roleRepository.save(r);
        });

        // 1. Создание Администратора (для использования в тестах)
        userRepository.findByEmail("admin@test.com").orElseGet(() -> {
            User u = User.builder().email("admin@test.com").password("pass").firstName("A").lastName("B").roles(Set.of(adminRole)).build();
            return userRepository.save(u);
        });

        // 2. Создание Обычного Пользователя (для использования в тестах)
        userRepository.findByEmail("user@test.com").orElseGet(() -> {
            User u = User.builder().email("user@test.com").password("pass").firstName("C").lastName("D").roles(Set.of(userRole)).build();
            return userRepository.save(u);
        });

        // 3. Создание тестового ресурса, который можно удалять/изменять
        testResource = Resource.builder().name("Room 101").description("Conference Room").build();
        testResource = resourceRepository.save(testResource);
    }

    // -----------------------------------------------------------------------
    // 1. ТЕСТЫ БЕЗОПАСНОСТИ (POST, PUT, DELETE) - Требуется ROLE_ADMIN
    // -----------------------------------------------------------------------

    @Test
    @WithMockUser(username = "admin@test.com", roles = {"ADMIN"})
    void createResource_asAdmin_shouldBeOk() throws Exception {
        Resource newResource = Resource.builder().name("New Room").description("New Desc").build();

        mockMvc.perform(post(RESOURCE_API)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newResource)))
                .andExpect(status().isCreated()) // 201 Created
                .andExpect(jsonPath("$.name").value("New Room"));
    }

    @Test
    @WithMockUser(username = "user@test.com", roles = {"USER"})
    void createResource_asUser_shouldBeForbidden() throws Exception {
        Resource newResource = Resource.builder().name("New Room").description("New Desc").build();

        mockMvc.perform(post(RESOURCE_API)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newResource)))
                .andExpect(status().isForbidden()); // 403 Forbidden
    }

    @Test
    @WithMockUser(username = "admin@test.com", roles = {"ADMIN"})
    void updateResource_asAdmin_shouldBeOk() throws Exception {
        Resource updatedDetails = Resource.builder().name("Updated Name").description("Updated Description").build();

        mockMvc.perform(put(RESOURCE_API + "/{id}", testResource.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedDetails)))
                .andExpect(status().isOk()) // 200 OK
                .andExpect(jsonPath("$.name").value("Updated Name"));
    }

    @Test
    @WithMockUser(username = "user@test.com", roles = {"USER"})
    void deleteResource_asUser_shouldBeForbidden() throws Exception {
        mockMvc.perform(delete(RESOURCE_API + "/{id}", testResource.getId()))
                .andExpect(status().isForbidden()); // 403 Forbidden
    }

    // -----------------------------------------------------------------------
    // 2. ТЕСТЫ НА ЧТЕНИЕ (GET) - Доступен всем (Благодаря SecurityConfig)
    // -----------------------------------------------------------------------

    @Test
    void getResourceById_withoutToken_shouldBeOk() throws Exception {
        // Проверяем, что неаутентифицированный пользователь может получить ресурс
        mockMvc.perform(get(RESOURCE_API + "/{id}", testResource.getId()))
                .andExpect(status().isOk()) // 200 OK
                .andExpect(jsonPath("$.name").value(testResource.getName()));
    }

    @Test
    @WithMockUser(roles = {"USER"})
    void getAllResources_asUser_shouldBeOk() throws Exception {
        // Проверяем, что аутентифицированный пользователь (даже не Admin) может получить список
        mockMvc.perform(get(RESOURCE_API))
                .andExpect(status().isOk()) // 200 OK
                .andExpect(jsonPath("$.content").isArray());
    }
}