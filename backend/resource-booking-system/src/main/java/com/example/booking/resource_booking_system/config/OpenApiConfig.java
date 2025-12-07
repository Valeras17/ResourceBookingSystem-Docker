package com.example.booking.resource_booking_system.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Конфигурация SpringDoc OpenAPI (Swagger).
 * Определяет метаданные API и схему авторизации JWT (Bearer Token).
 */
@Configuration
public class OpenApiConfig {

    private static final String SCHEME_NAME = "BearerAuth";
    private static final String SCHEME = "Bearer";

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                // 1. Метаданные (Информация о приложении)
                .info(new Info()
                        .title("Resource Booking System API")
                        .version("1.0")
                        .description("API для системы бронирования ресурсов (комнат, оборудования и т.д.). " +
                                "Для тестирования защищенных эндпоинтов используйте кнопку 'Authorize'."))

                // 2. Настройка JWT-аутентификации (Bearer Token)
                .components(new Components()
                        .addSecuritySchemes(SCHEME_NAME, new SecurityScheme()
                                .name(SCHEME_NAME)
                                .type(SecurityScheme.Type.HTTP) // Тип схемы: HTTP-авторизация
                                .scheme(SCHEME)                  // Схема: Bearer
                                .bearerFormat("JWT")             // Формат токена: JWT
                                .description("Введите JWT-токен, полученный после успешного логина.")))

                // 3. Применение JWT-аутентификации ко всем эндпоинтам (глобально)
                .addSecurityItem(new SecurityRequirement().addList(SCHEME_NAME));
    }
}