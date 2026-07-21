package com.example.demo.config;

import org.springframework.security.web.AuthenticationEntryPoint;
import com.example.demo.security.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;

import java.util.List;

@Configuration
public class SecurityConfig {

    // Central security configuration for the application.
    // This class defines which endpoints are public, which require authentication,
    // and which roles are allowed to access protected resources.
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtAuthFilter jwtAuthFilter, AuthenticationEntryPoint authenticationEntryPoint) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(request -> {
                CorsConfiguration config = new CorsConfiguration();
                config.setAllowedOrigins(List.of("*"));
                config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
                config.setAllowedHeaders(List.of("*"));
                return config;
            }))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/login").permitAll()
                .requestMatchers(HttpMethod.GET, "/*.html").permitAll()
                .requestMatchers(HttpMethod.GET, "/*.css").permitAll()
                .requestMatchers(HttpMethod.GET, "/*.js").permitAll()
                .requestMatchers(HttpMethod.GET, "/assets/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/window").permitAll()
                .requestMatchers(HttpMethod.GET, "/queue/all-queue").permitAll()
                .requestMatchers(HttpMethod.GET, "/queue/all-serving").permitAll()
                .requestMatchers(HttpMethod.POST, "/users").permitAll()
                .requestMatchers(HttpMethod.POST, "/queue").permitAll()
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/employee/*/admin-reset-password").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/employee/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
                // Just worth being aware of for future additions
                // Spring Security rule ordering bugs are a common source of
                // "why can employees suddenly do X" surprises.
            .exceptionHandling(handler -> handler.authenticationEntryPoint(authenticationEntryPoint))
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}