package com.example.demo.services;

import com.example.demo.exceptions.InvalidOperationException;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.models.Admin;
import com.example.demo.repositories.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AdminService {

    // Service layer for administrator account management.
    // These methods keep admin accounts secure and prevent unsafe deletion.
    private final AdminRepository adminRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Autowired
    public AdminService(AdminRepository adminRepository, BCryptPasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<Admin> getAllAdmins() {
        return adminRepository.findByIsActiveTrue();
    }

    // Create a new admin account with a hashed password.
    public Admin createAdmin(Admin admin) {
        String hashedPassword = passwordEncoder.encode(admin.getPassword());
        admin.setPassword(hashedPassword);
        return adminRepository.save(admin);
    }

    // Update editable admin profile fields without changing the password.
    public Admin updateAdmin(Integer id, Admin updatedAdmin) {
        Optional<Admin> existingAdmin = adminRepository.findById(id);
        if(existingAdmin.isPresent()) {
            Admin admin = existingAdmin.get();
            admin.setName(updatedAdmin.getName());
            admin.setEmail(updatedAdmin.getEmail());
            return adminRepository.save(admin);
        }
        throw new ResourceNotFoundException("Admin with ID " + id + " not found");
    }

    // Soft-delete an admin only when another active admin remains available.
    public void deleteAdmin(Integer id) {
        List<Admin> activeAdmins = adminRepository.findByIsActiveTrue();
        if(activeAdmins.size() > 1) {
            Optional<Admin> existingAdmin = adminRepository.findById(id);
            if(existingAdmin.isPresent()) {
                Admin admin = existingAdmin.get();
                admin.setActive(false);
                adminRepository.save(admin);
            } else {
                throw new ResourceNotFoundException("Admin with ID " + id + " not found");
            }
        } else {
            throw new InvalidOperationException("Cannot delete admin ID " + id + " if there is only one admin.");
        }
    }
}
