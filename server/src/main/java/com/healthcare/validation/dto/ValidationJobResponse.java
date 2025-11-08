package com.healthcare.validation.dto;

import com.healthcare.validation.domain.enums.JobStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidationJobResponse {
    private String jobId;
    private JobStatus status;
    private Integer totalProviders;
    private Integer completedProviders;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
}
