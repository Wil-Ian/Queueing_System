package com.example.demo.controllers;

import com.example.demo.services.HelloService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/hello")
public class HelloController {
    @Autowired
    private HelloService helloService;

    @GetMapping("/{name}")
    public String getName(@PathVariable String name) {
        return helloService.greet(name);
    }

    @PostMapping
    public String getUser(@RequestBody String user) {
        return helloService.greet(user);
    }
}