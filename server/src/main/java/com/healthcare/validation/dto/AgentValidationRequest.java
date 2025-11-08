package com.healthcare.validation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentValidationRequest {
    private String jobId;
    private Long providerId;
    private String npi;
    private String name;
    private String specialty;
    private String state;
}
