package com.policefir;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class PoliceFirApplication {

    public static void main(String[] args) {
        SpringApplication.run(PoliceFirApplication.class, args);
        System.out.println("=================================================================");
        System.out.println("Police FIR Management System - Spring Boot Backend Running on 8080");
        System.out.println("Swagger UI Documentation: http://localhost:8080/swagger-ui.html");
        System.out.println("=================================================================");
    }
}
