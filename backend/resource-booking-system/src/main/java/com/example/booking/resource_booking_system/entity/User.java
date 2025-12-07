package com.example.booking.resource_booking_system.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.HashSet; // <-- НОВЫЙ ИМПОРТ
import java.util.List;
import java.util.Set;    // <-- НОВЫЙ ИМПОРТ
import java.util.stream.Collectors; // <-- НОВЫЙ ИМПОРТ

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "USERS")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "FIRST_NAME")
    private String firstName;

    @Column(name = "LAST_NAME")
    private String lastName;

    @OneToMany(mappedBy = "user")
    private List<Booking> bookings;

    // ----------- НОВАЯ ЧАСТЬ: РОЛИ -----------

    // Связь Many-to-Many с Role
    @ManyToMany(fetch = FetchType.EAGER) // Используем EAGER, чтобы роли загружались вместе с пользователем
    @JoinTable(name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles = new HashSet<>();

    // ----------- Методы ИЗ ИНТЕРФЕЙСА UserDetails -----------

    // 1. Возвращает права пользователя (теперь динамически!)
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Преобразуем Set<Role> в коллекцию Spring Security GrantedAuthority
        return this.roles.stream()
                .map(role -> new SimpleGrantedAuthority(role.getName().name()))
                .collect(Collectors.toList());
    }

    // 2. Возвращает пароль
    @Override
    public String getPassword() {
        return password;
    }

    // 3. Возвращает логин (email)
    @Override
    public String getUsername() {
        return email;
    }

    // ... (остальные методы isAccountNonExpired и т.д. остаются без изменений)
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }
}