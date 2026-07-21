package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DemoApplication {

    // Entry point for the Spring Boot application.
    // Scheduling is enabled here because the queue service uses background jobs
    // to expire stale queue records at midnight.
    public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}
}
