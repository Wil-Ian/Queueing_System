package com.example.demo.services;

import com.example.demo.dto.AuthResponse;
import com.example.demo.exceptions.InvalidCredentialsException;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.models.Admin;
import com.example.demo.models.BlacklistedTokens;
import com.example.demo.models.Employee;
import com.example.demo.repositories.AdminRepository;
import com.example.demo.repositories.BlacklistedTokensRepository;
import com.example.demo.repositories.EmployeeRepository;
import com.example.demo.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    // Authentication service for staff and admin login flows.
    // This class issues JWT tokens, refreshes sessions, and invalidates tokens on logout.
    private final AdminRepository adminRepository;
    private final EmployeeRepository employeeRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil util;
    private final BlacklistedTokensRepository blacklistedTokensRepository;

    @Autowired
    public AuthService(AdminRepository adminRepository, EmployeeRepository employeeRepository, BCryptPasswordEncoder passwordEncoder, JwtUtil util, BlacklistedTokensRepository blacklistedTokensRepository) {
        this.adminRepository = adminRepository;
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
        this.util = util;
        this.blacklistedTokensRepository = blacklistedTokensRepository;
    }

    // Authenticate a user by email and password, then return the correct role-based token pair.
    public AuthResponse login(String email, String password) {
        
        Optional<Employee> existingEmployee = employeeRepository.findByEmail(email);
        Optional<Admin> existingAdmin = adminRepository.findByEmail(email);
        if(existingEmployee.isPresent()) {
            Employee employee = existingEmployee.get();
            if (!Boolean.TRUE.equals(employee.getActive())) {
                throw new InvalidCredentialsException("Account is deactivated.");
            }
            if(passwordEncoder.matches(password, employee.getPassword())) {
                AuthResponse authResponse = new AuthResponse();
                authResponse.setAccessToken(util.generateToken(email, "EMPLOYEE"));
                authResponse.setRole("EMPLOYEE");
                authResponse.setRefreshToken(util.generateRefreshToken(email));
                return authResponse;
            } else {
                throw new InvalidCredentialsException("Invalid password.");
            }
        } else if(existingAdmin.isPresent()) {
            Admin admin = existingAdmin.get();
            if (!Boolean.TRUE.equals(admin.getActive())) {
                throw new InvalidCredentialsException("Account is deactivated.");
            }
            if(passwordEncoder.matches(password, admin.getPassword())) {
                AuthResponse authResponse = new AuthResponse();
                authResponse.setAccessToken(util.generateToken(email, "ADMIN"));
                authResponse.setRole("ADMIN");
                authResponse.setRefreshToken(util.generateRefreshToken(email));
                return authResponse;
            } else {
                throw new InvalidCredentialsException("Invalid password.");
            }
        } else {
            throw new ResourceNotFoundException("No account found with this email.");
        }
    }

    // Issue a new access token from a refresh token without forcing the user to log in again.
    public AuthResponse refresh(String refreshToken) {
        if (!util.isTokenValid(refreshToken) || !"refresh".equals(util.extractType(refreshToken))) {
            throw new InvalidCredentialsException("Invalid refresh token.");
        }
        if (blacklistedTokensRepository.existsByJti(util.extractJti(refreshToken))) {
            throw new InvalidCredentialsException("Refresh token has been revoked.");
        }

        String email = util.extractEmail(refreshToken);
        Optional<Employee> existingEmployee = employeeRepository.findByEmail(email);
        Optional<Admin> existingAdmin = adminRepository.findByEmail(email);
        if (existingEmployee.isPresent()) {
            Employee employee = existingEmployee.get();
            if (!Boolean.TRUE.equals(employee.getActive())) {
                throw new InvalidCredentialsException("Account is deactivated.");
            }
            AuthResponse authResponse = new AuthResponse();
            authResponse.setAccessToken(util.generateToken(email, "EMPLOYEE"));
            return authResponse;
        } else if (existingAdmin.isPresent()) {
            Admin admin = existingAdmin.get();
            if (!Boolean.TRUE.equals(admin.getActive())) {
                throw new InvalidCredentialsException("Account is deactivated.");
            }
            AuthResponse authResponse = new AuthResponse();
            authResponse.setAccessToken(util.generateToken(email, "ADMIN"));
            return authResponse;
        } else {
            throw new ResourceNotFoundException("No user with that email exists in our database.");
        }
    }

    // Blacklist the current token so it cannot be reused after logout.
    public void logout(String accessToken, String refreshToken) {
    blacklist(util.extractJti(accessToken));
        if (refreshToken != null && util.isTokenValid(refreshToken)) {
            blacklist(util.extractJti(refreshToken));
        }
    }

    private void blacklist(String jti) {
    BlacklistedTokens t = new BlacklistedTokens();
        t.setJti(jti);
        blacklistedTokensRepository.save(t);
    }
}
