package com.example.demo.exceptions;

public class InvalidOperationException extends RuntimeException{
    private String code;
    public InvalidOperationException(String message) {
        super(message);
    }

    public InvalidOperationException(String message, String code) {
        super(message);
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}
