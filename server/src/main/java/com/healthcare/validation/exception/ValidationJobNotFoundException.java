package com.healthcare.validation.exception;

public class ValidationJobNotFoundException extends RuntimeException {
    
    public ValidationJobNotFoundException(String jobId) {
        super("Validation job not found with ID: " + jobId);
    }
}
