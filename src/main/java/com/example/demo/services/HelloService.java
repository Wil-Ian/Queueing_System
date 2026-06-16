package com.example.demo.services;

import org.springframework.stereotype.Service;

@Service
public class HelloService {

    public String greet(String name) {
        return "Hello, " + name + "!";
    }

}