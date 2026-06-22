package com.example.demo.repositories;

import com.example.demo.models.Admin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

// The type after the model is the primary key
public interface AdminRepository extends JpaRepository<Admin, Integer> {
    List<Admin> findByIsActiveTrue();
    Optional<Admin> findByEmail(String email);
}
