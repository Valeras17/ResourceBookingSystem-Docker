package com.example.booking.resource_booking_system.config;

import com.example.booking.resource_booking_system.auth.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component // Объявляем как Spring Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService; // Мы определили его в ApplicationConfig

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        // 1. Извлекаем заголовок "Authorization"
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        // 2. Проверяем, есть ли заголовок и начинается ли он с "Bearer "
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Извлекаем токен (после "Bearer ")
        jwt = authHeader.substring(7);
        userEmail = jwtService.extractUsername(jwt); // Извлекаем email из токена

        // 4. Проверяем, что email не пустой И пользователь НЕ аутентифицирован
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // 5. Загружаем пользователя из БД
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

            // 6. Проверяем, валиден ли токен
            if (jwtService.isTokenValid(jwt, userDetails)) {

                // 7. Создаем объект аутентификации для Spring Security
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );

                // Добавляем детали запроса
                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                // 8. Сохраняем пользователя в контексте безопасности
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // 9. Передаем запрос дальше по цепочке фильтров
        filterChain.doFilter(request, response);

    }
    // Этот метод указывает Spring'у, что фильтр должен быть проигнорирован
    // для определенных путей (тех, которые доступны без аутентификации).
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        // Мы игнорируем фильтр для всех путей, начинающихся с "/api/auth"
        return request.getServletPath().startsWith("/api/auth");
    }
}