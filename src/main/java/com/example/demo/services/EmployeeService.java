package com.example.demo.services;

import com.example.demo.exceptions.InvalidCredentialsException;
import com.example.demo.exceptions.InvalidOperationException;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.models.Employee;
import com.example.demo.repositories.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EmployeeService {
    private final EmployeeRepository employeeRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Autowired
    public EmployeeService(EmployeeRepository employeeRepository, BCryptPasswordEncoder passwordEncoder) {
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<Employee> getAllEmployees() {
        return employeeRepository.findByIsActiveTrue();
    }

    public Employee createEmployee(Employee employee) {
        if(employee.getWindow() == null) {
            throw new InvalidOperationException("Employee is not assigned a window.", "EMPLOYEE_NO_WINDOW");
        }
        String hashedPassword = passwordEncoder.encode(employee.getPassword());
        employee.setPassword(hashedPassword);
        employee.setActive(true);
        return employeeRepository.save(employee);
    }

    public Employee updateEmployee(Integer id, Employee updatedEmployee) {
        Optional<Employee> existingEmployee = employeeRepository.findById(id);
        if(existingEmployee.isPresent()) {
            Employee employee = existingEmployee.get();
            if (updatedEmployee.getEmail() != null && !updatedEmployee.getEmail().isBlank()) {
                employee.setEmail(updatedEmployee.getEmail());
            }
            if (updatedEmployee.getName() != null && !updatedEmployee.getName().isBlank()) {
                employee.setName(updatedEmployee.getName());
            }
            employee.setWindow(updatedEmployee.getWindow());
            return employeeRepository.save(employee);
        }
        throw new ResourceNotFoundException("Employee with ID " + id + " not found");
    }

    public void deleteEmployee(Integer id) {
        Optional<Employee> existingEmployee = employeeRepository.findById(id);
        if(existingEmployee.isPresent()) {
            Employee employee = existingEmployee.get();
            employee.setActive(false);
            employeeRepository.save(employee);
        } else {
            throw new ResourceNotFoundException("Employee with ID " + id + " not found");
        }
    }

    public Employee getCurrentEmployee(String email) {
        Optional<Employee> existingEmployee = employeeRepository.findByEmail(email);
        if(existingEmployee.isPresent()) {
            return existingEmployee.get();
        } else {
            throw new ResourceNotFoundException("Employee with email " + email + " not found");
        }
    }

    public Employee patchName(Integer id, String name) {
        Optional<Employee> existingEmployee = employeeRepository.findById(id);
        if(existingEmployee.isPresent()) {
            Employee employee = existingEmployee.get();
            employee.setName(name);
            return employeeRepository.save(employee);
        }
        throw new ResourceNotFoundException("Employee with ID " + id + " not found");
    }

    public Employee patchEmployeePassword(Integer id, String password, String newPassword) {
        Optional<Employee> existingEmployee = employeeRepository.findById(id);
        if(existingEmployee.isPresent()) {
            Employee employee = existingEmployee.get();
            if(passwordEncoder.matches(password, employee.getPassword())) {
                String hashedPassword = passwordEncoder.encode(newPassword);
                employee.setPassword(hashedPassword);
                return employeeRepository.save(employee);
            } else {
                throw new InvalidCredentialsException("Password does not match.");
            }
        } else {
            throw new ResourceNotFoundException("Employee with ID " + id + " not found");
        }
    }

    public void adminResetPassword(Integer id, String newPassword) {
        Optional<Employee> existingEmployee = employeeRepository.findById(id);
        if(existingEmployee.isPresent()) {
            Employee employee = existingEmployee.get();
            String hashedPassword = passwordEncoder.encode(newPassword);
            employee.setPassword(hashedPassword);
            employeeRepository.save(employee);
        } else {
            throw new ResourceNotFoundException("Employee with ID " + id + " not found");
        }
    }
}
