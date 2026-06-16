package com.example.demo.repositories;

import com.example.demo.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

// The type after the model is the primary key
public interface UserRepository extends JpaRepository<User, Integer> {
}
