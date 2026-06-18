package com.example.demo.repositories;

import com.example.demo.models.Window;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

// The type after the model is the primary key
public interface WindowRepository extends JpaRepository<Window, Integer> {
    List<Window> findByIsActiveTrue();
}
