package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DemoApplication {

    // spring.jpa.open-in-view is enabled during development phase and can be
	// turned off after deployment to improve performance
	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}
}
