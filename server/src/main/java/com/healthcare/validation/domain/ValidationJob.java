package com.healthcare.validation.domain;

import com.healthcare.validation.domain.enums.JobStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "validation_jobs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidationJob {

    @Id
    @Column(length = 50)
    private String id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private JobStatus status;

    @Column(name = "total_providers")
    private Integer totalProviders;

    @Column(name = "completed_providers")
    @Builder.Default
    private Integer completedProviders = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}
