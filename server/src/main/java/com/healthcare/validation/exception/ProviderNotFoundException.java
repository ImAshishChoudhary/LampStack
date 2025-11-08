package com.healthcare.validation.exception;

public class ProviderNotFoundException extends RuntimeException {
    
    public ProviderNotFoundException(Long id) {
        super("Provider not found with ID: " + id);
    }

    public ProviderNotFoundException(String npi) {
        super("Provider not found with NPI: " + npi);
    }
}
