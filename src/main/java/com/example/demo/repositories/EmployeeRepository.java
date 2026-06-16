package com.example.demo.repositories;

import com.example.demo.models.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

// The type after the model is the primary key
public interface EmployeeRepository extends JpaRepository<Employee, Integer> {
}
