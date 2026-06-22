package com.example.demo.repositories;

import com.example.demo.models.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

// The type after the model is the primary key
public interface EmployeeRepository extends JpaRepository<Employee, Integer> {
    List<Employee> findByIsActiveTrue();
    Optional<Employee> findByEmail(String email);
}
