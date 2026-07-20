package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DemoApplication {

    // spring.jpa.open-in-view is enabled during development phase and can be
	// turned off after deployment to improve performance
	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}
}
