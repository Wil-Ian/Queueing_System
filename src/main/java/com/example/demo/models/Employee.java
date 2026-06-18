package com.example.demo.models;

import jakarta.persistence.*;

@Entity
@Table(name = "employee")
public class Employee extends Person{
    @Id
    private Integer employeeId;

    @OneToOne
    @JoinColumn(name= "window_id")
    private Window window;

    @Column(name = "is_active")
    private Boolean isActive;

    public Integer getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Integer employeeId) {
        this.employeeId = employeeId;
    }

    public Window getWindow() {
        return window;
    }

    public void setWindow(Window window) {
        this.window = window;
    }

    public Boolean getActive() {
        return isActive;
    }

    public void setActive(Boolean active) {
        isActive = active;
    }
}
