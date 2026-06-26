package com.example.demo.controllers;

import com.example.demo.dto.AuthResponse;
import com.example.demo.dto.LoginRequest;
import com.example.demo.exceptions.InvalidCredentialsException;
import com.example.demo.services.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
        return authService.login(request.getEmail(), request.getPassword());
    }

    @PostMapping("/logout")
    public String logout(@RequestHeader("Authorization") String authHeader) {
        if(authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            authService.logout(token);
            return "Logged out successfully.";
        }
        return "Error with header.";
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(@RequestHeader("Authorization") String authHeader) {
        if(authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return authService.refresh(token);
        }
        throw new InvalidCredentialsException("Invalid header.");
    }
}
