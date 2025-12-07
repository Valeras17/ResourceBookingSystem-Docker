package com.example.booking.resource_booking_system.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Builder // <-- ДОБАВЬТЕ ЭТУ АННОТАЦИЮ
@Table(name = "resources")
@Data // Lombok: генерирует геттеры, сеттеры, toString, equals и hashCode
@NoArgsConstructor // Lombok: генерирует конструктор без аргументов
@AllArgsConstructor



public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // Например, "Переговорная Комната №1"

    private String description; // Описание

}