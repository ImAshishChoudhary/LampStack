package com.healthcare.validation.exception;

public class DuplicateProviderException extends RuntimeException {
    
    public DuplicateProviderException(String npi) {
        super("Provider already exists with NPI: " + npi);
    }
}
