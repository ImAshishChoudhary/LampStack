package com.healthcare.validation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgressUpdate {
    private String jobId;
    private Long providerId;
    private String stage;
    private String status;
    private Map<String, Object> data;
}
