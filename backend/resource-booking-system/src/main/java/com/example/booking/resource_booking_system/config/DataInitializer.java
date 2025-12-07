package com.example.booking.resource_booking_system.config;

import com.example.booking.resource_booking_system.entity.ERole;
import com.example.booking.resource_booking_system.entity.Role;
import com.example.booking.resource_booking_system.entity.User;
import com.example.booking.resource_booking_system.repository.RoleRepository;
import com.example.booking.resource_booking_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Инициализация ролей
        initializeRoles();

        // 2. Инициализация тестового пользователя-администратора
        initializeAdminUser();
    }

    private void initializeRoles() {
        System.out.println("--- Checking and initializing application roles... ---");

        // Создаем роль USER, если она не существует
        if (roleRepository.findByName(ERole.ROLE_USER).isEmpty()) {
            Role userRole = new Role();
            userRole.setName(ERole.ROLE_USER);
            roleRepository.save(userRole);
            System.out.println("  ✅ Role 'ROLE_USER' created.");
        } else {
            System.out.println("  ▶️ Role 'ROLE_USER' already exists.");
        }

        // Создаем роль ADMIN, если она не существует
        if (roleRepository.findByName(ERole.ROLE_ADMIN).isEmpty()) {
            Role adminRole = new Role();
            adminRole.setName(ERole.ROLE_ADMIN);
            roleRepository.save(adminRole);
            System.out.println("  ✅ Role 'ROLE_ADMIN' created.");
        } else {
            System.out.println("  ▶️ Role 'ROLE_ADMIN' already exists.");
        }

        System.out.println("--- Role initialization complete. ---");
    }

    private void initializeAdminUser() {
        final String adminEmail = "admin@booking.com";

        // Проверяем, существует ли уже пользователь-администратор
        if (userRepository.findByEmail(adminEmail).isEmpty()) {

            // Находим роль ADMIN
            Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                    .orElseThrow(() -> new RuntimeException("Error: ADMIN Role is not found. Please check DB."));

            Set<Role> roles = new HashSet<>();
            roles.add(adminRole);

            // Создаем пользователя
            User admin = User.builder()
                    .firstName("Super")
                    .lastName("Admin")
                    .email(adminEmail)
                    .password(passwordEncoder.encode("admin123")) // Пароль: admin123
                    .roles(roles)
                    .build();

            userRepository.save(admin);
            System.out.println("--- ✅ ADMIN USER CREATED: " + adminEmail + " / admin123 ---");
        } else {
            System.out.println("--- ⏸️ ADMIN USER already exists: " + adminEmail + " ---");
        }
    }
}