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

    public AuthResponse login(String email, String password) {
        Optional<Employee> existingEmployee = employeeRepository.findByEmail(email);
        Optional<Admin> existingAdmin = adminRepository.findByEmail(email);
        if(existingEmployee.isPresent()) {
            Employee employee = existingEmployee.get();
            if(passwordEncoder.matches(password, employee.getPassword())) {
                AuthResponse authResponse = new AuthResponse();
                authResponse.setAccessToken(util.generateToken(email, "EMPLOYEE"));
                authResponse.setRefreshToken(util.generateRefreshToken(email));
                return authResponse;
            } else {
                throw new InvalidCredentialsException("Invalid password.");
            }
        } else if(existingAdmin.isPresent()) {
            Admin admin = existingAdmin.get();
            if(passwordEncoder.matches(password, admin.getPassword())) {
                AuthResponse authResponse = new AuthResponse();
                authResponse.setAccessToken(util.generateToken(email, "ADMIN"));
                authResponse.setRefreshToken(util.generateRefreshToken(email));
                return authResponse;
            } else {
                throw new InvalidCredentialsException("Invalid password.");
            }
        } else {
            throw new ResourceNotFoundException("No account found with this email.");
        }
    }

    public AuthResponse refresh(String refreshToken) {
        String email = util.extractEmail(refreshToken);
        Optional<Employee> existingEmployee = employeeRepository.findByEmail(email);
        Optional<Admin> existingAdmin = adminRepository.findByEmail(email);
        if(existingEmployee.isPresent()) {
            AuthResponse authResponse = new AuthResponse();
            authResponse.setAccessToken(util.generateToken(email, "EMPLOYEE"));
            return authResponse;
        } else if(existingAdmin.isPresent()) {
            AuthResponse authResponse = new AuthResponse();
            authResponse.setAccessToken(util.generateToken(email, "ADMIN"));
            return authResponse;
        } else {
            throw new ResourceNotFoundException("No user with that email exists in our database.");
        }
    }

    public void logout(String token) {
        String jti = util.extractJti(token);

        BlacklistedTokens blacklistedToken = new BlacklistedTokens();
        blacklistedToken.setJti(jti);
        blacklistedTokensRepository.save(blacklistedToken);
    }
}
