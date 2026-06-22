package com.example.demo.services;

import com.example.demo.exceptions.InvalidCredentialsException;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.models.Admin;
import com.example.demo.models.Employee;
import com.example.demo.repositories.AdminRepository;
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

    @Autowired
    public AuthService(AdminRepository adminRepository, EmployeeRepository employeeRepository, BCryptPasswordEncoder passwordEncoder, JwtUtil util) {
        this.adminRepository = adminRepository;
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
        this.util = util;
    }

    public String login(String email, String password) {
        Optional<Employee> existingEmployee = employeeRepository.findByEmail(email);
        Optional<Admin> existingAdmin = adminRepository.findByEmail(email);
        if(existingEmployee.isPresent()) {
            Employee employee = existingEmployee.get();
            if(passwordEncoder.matches(password, employee.getPassword())) {
                return util.generateToken(email, "EMPLOYEE");
            } else {
                throw new InvalidCredentialsException("Invalid password.");
            }
        } else if(existingAdmin.isPresent()) {
            Admin admin = existingAdmin.get();
            if(passwordEncoder.matches(password, admin.getPassword())) {
                return util.generateToken(email, "ADMIN");
            } else {
                throw new InvalidCredentialsException("Invalid password.");
            }
        } else {
            throw new ResourceNotFoundException("No account found with this email.");
        }
    }
}
