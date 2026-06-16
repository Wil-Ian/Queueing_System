package com.example.demo.repositories;

import com.example.demo.models.Admin;
import org.springframework.data.jpa.repository.JpaRepository;

// The type after the model is the primary key
public interface AdminRepository extends JpaRepository<Admin, Integer> {
}
