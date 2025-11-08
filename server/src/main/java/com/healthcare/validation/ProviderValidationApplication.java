package com.healthcare.validation;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ProviderValidationApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProviderValidationApplication.class, args);
    }
}
