package com.example.demo.repositories;

import com.example.demo.models.Queue;
import org.springframework.data.jpa.repository.JpaRepository;

// The type after the model is the primary key
public interface QueueRepository extends JpaRepository<Queue, Integer> {
}
