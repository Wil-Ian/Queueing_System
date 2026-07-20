package com.example.demo.controllers;

import com.example.demo.dto.ChangePasswordRequest;
import com.example.demo.dto.ResetPasswordRequest;
import com.example.demo.models.Employee;
import com.example.demo.services.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/employee")
public class EmployeeController {

    private final EmployeeService employeeService;

    @Autowired
    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping
    public List<Employee> getAllEmployees() {
        return employeeService.getAllEmployees();
    }

    @GetMapping("/me")
    public Employee getCurrentEmployee(Principal principal) {
        String email = principal.getName();
        return employeeService.getCurrentEmployee(email);
    }

    @PostMapping
    public Employee createEmployee(@RequestBody Employee employee) {
        return employeeService.createEmployee(employee);
    }

    @PutMapping("/{id}")
    public Employee updateEmployee(@PathVariable Integer id, @RequestBody Employee employee) {
        return employeeService.updateEmployee(id, employee);
    }

    @DeleteMapping("/{id}")
    public void deleteEmployee(@PathVariable Integer id) {
        employeeService.deleteEmployee(id);
    }

    @PatchMapping("/{id}/name")
    public Employee patchName(@PathVariable Integer id, @RequestBody String name) {
        return employeeService.patchName(id, name);
    }

    @PatchMapping("/{id}/password")
    public Employee patchPassword(@PathVariable Integer id, @RequestBody ChangePasswordRequest request) {
        return employeeService.patchEmployeePassword(id, request.getCurrentPassword(), request.getNewPassword());
    }

    @PatchMapping("/{id}/admin-reset-password")
    public void resetEmployeePassword(@PathVariable Integer id, @RequestBody ResetPasswordRequest request) {
        employeeService.adminResetPassword(id, request.getNewPassword());
    }
}
