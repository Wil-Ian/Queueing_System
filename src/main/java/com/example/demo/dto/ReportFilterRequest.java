package com.example.demo.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ReportFilterRequest {
    private List<String> categories;
    private String status;
    private String priority;
    private LocalDateTime enteredFrom;
    private LocalDateTime enteredTo;
    private LocalDateTime servingStartedFrom;
    private LocalDateTime servingStartedTo;
    private LocalDateTime completedFrom;
    private LocalDateTime completedTo;

    // getters and setters for all fields

    public List<String> getCategories() {
        return categories;
    }

    public void setCategories(List<String> categories) {
        this.categories = categories;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public LocalDateTime getEnteredFrom() {
        return enteredFrom;
    }

    public void setEnteredFrom(LocalDateTime enteredFrom) {
        this.enteredFrom = enteredFrom;
    }

    public LocalDateTime getEnteredTo() {
        return enteredTo;
    }

    public void setEnteredTo(LocalDateTime enteredTo) {
        this.enteredTo = enteredTo;
    }

    public LocalDateTime getServingStartedFrom() {
        return servingStartedFrom;
    }

    public void setServingStartedFrom(LocalDateTime servingStartedFrom) {
        this.servingStartedFrom = servingStartedFrom;
    }

    public LocalDateTime getServingStartedTo() {
        return servingStartedTo;
    }

    public void setServingStartedTo(LocalDateTime servingStartedTo) {
        this.servingStartedTo = servingStartedTo;
    }

    public LocalDateTime getCompletedFrom() {
        return completedFrom;
    }

    public void setCompletedFrom(LocalDateTime completedFrom) {
        this.completedFrom = completedFrom;
    }

    public LocalDateTime getCompletedTo() {
        return completedTo;
    }

    public void setCompletedTo(LocalDateTime completedTo) {
        this.completedTo = completedTo;
    }
}