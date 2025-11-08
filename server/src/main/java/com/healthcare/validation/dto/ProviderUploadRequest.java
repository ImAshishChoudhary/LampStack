package com.healthcare.validation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProviderUploadRequest {
    private String npi;
    private String firstName;
    private String lastName;
    private String specialty;
    private String state;
    private String address;
    private String city;
    private String zipCode;
    private String phone;
    private String email;
}
