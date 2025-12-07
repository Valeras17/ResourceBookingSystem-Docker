package com.example.booking.resource_booking_system.auth;

import com.example.booking.resource_booking_system.dto.AuthenticationRequest;
import com.example.booking.resource_booking_system.dto.AuthenticationResponse;
import com.example.booking.resource_booking_system.dto.RegisterRequest;
import com.example.booking.resource_booking_system.entity.ERole; // <-- НОВЫЙ ИМПОРТ
import com.example.booking.resource_booking_system.entity.Role;   // <-- НОВЫЙ ИМПОРТ
import com.example.booking.resource_booking_system.entity.User;
import com.example.booking.resource_booking_system.repository.RoleRepository; // <-- НОВЫЙ ИМПОРТ
import com.example.booking.resource_booking_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository; // <-- НОВЫЙ ИНЖЕКТ
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    // Метод для регистрации нового пользователя
    public AuthenticationResponse register(RegisterRequest request) {

        // 1. Находим роль пользователя по умолчанию
        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("Error: Role is not found. Please initialize roles in DB."));

        // 2. Создаем коллекцию ролей
        Set<Role> roles = new HashSet<>();
        roles.add(userRole);

        // 3. Создаем объект User из DTO
        var user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .roles(roles) // <-- ПРИСВАИВАЕМ РОЛЬ!
                .build();

        // 4. Сохраняем пользователя в БД
        userRepository.save(user);

        // 5. Генерируем токен (теперь токен будет содержать информацию о роли)
        var jwtToken = jwtService.generateToken(user);

        // 6. Возвращаем токен
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .build();
    }

    // Метод для аутентификации (логина) существующего пользователя
    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        // ... (остается без изменений, поскольку все роли загружаются через userDetails)
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();

        var jwtToken = jwtService.generateToken(user);

        return AuthenticationResponse.builder()
                .token(jwtToken)
                .build();
    }
}