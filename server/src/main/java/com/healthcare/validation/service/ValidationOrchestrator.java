package com.healthcare.validation.service;

import com.healthcare.validation.domain.Provider;
import com.healthcare.validation.domain.ValidationJob;
import com.healthcare.validation.domain.enums.JobStatus;
import com.healthcare.validation.dto.AgentValidationRequest;
import com.healthcare.validation.dto.ValidationJobResponse;
import com.healthcare.validation.dto.ValidationTriggerRequest;
import com.healthcare.validation.exception.ProviderNotFoundException;
import com.healthcare.validation.exception.ValidationJobNotFoundException;
import com.healthcare.validation.repository.ProviderRepository;
import com.healthcare.validation.repository.ValidationJobRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ValidationOrchestrator {

    private final ValidationJobRepository jobRepository;
    private final ProviderRepository providerRepository;
    private final PythonAgentClient pythonAgentClient;
    private final WebSocketNotificationService websocketService;

    @Transactional
    public ValidationJobResponse triggerValidation(ValidationTriggerRequest request) {
        String jobId = generateJobId();

        ValidationJob job = ValidationJob.builder()
                .id(jobId)
                .status(JobStatus.QUEUED)
                .totalProviders(request.getProviderIds().size())
                .completedProviders(0)
                .build();

        ValidationJob saved = jobRepository.save(job);
        log.info("Created validation job: {}", jobId);

        websocketService.notifyJobCreated(jobId);

        processValidationAsync(jobId, request.getProviderIds());

        return mapToResponse(saved);
    }

    @Async
    public void processValidationAsync(String jobId, List<Long> providerIds) {
        log.info("Starting async validation for job: {}", jobId);

        updateJobStatus(jobId, JobStatus.RUNNING);

        for (Long providerId : providerIds) {
            try {
                processProviderValidation(jobId, providerId);
            } catch (Exception e) {
                log.error("Failed to validate provider {}: {}", providerId, e.getMessage());
            }
        }

        completeJob(jobId);
    }

    private void processProviderValidation(String jobId, Long providerId) {
        Provider provider = providerRepository.findById(providerId)
                .orElseThrow(() -> new ProviderNotFoundException(providerId));

        AgentValidationRequest request = AgentValidationRequest.builder()
                .jobId(jobId)
                .providerId(providerId)
                .npi(provider.getNpi())
                .name(provider.getFirstName() + " " + provider.getLastName())
                .specialty(provider.getSpecialty())
                .state(provider.getState())
                .build();

        pythonAgentClient.triggerValidation(request);
        
        incrementCompletedProviders(jobId);
    }

    @Transactional
    public void updateJobStatus(String jobId, JobStatus status) {
        ValidationJob job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ValidationJobNotFoundException(jobId));

        job.setStatus(status);
        jobRepository.save(job);

        websocketService.notifyJobStatusChanged(jobId, status);
    }

    @Transactional
    public void incrementCompletedProviders(String jobId) {
        ValidationJob job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ValidationJobNotFoundException(jobId));

        job.setCompletedProviders(job.getCompletedProviders() + 1);
        jobRepository.save(job);

        websocketService.notifyJobProgress(jobId, job.getCompletedProviders(), job.getTotalProviders());
    }

    @Transactional
    public void completeJob(String jobId) {
        ValidationJob job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ValidationJobNotFoundException(jobId));

        job.setStatus(JobStatus.COMPLETED);
        job.setCompletedAt(LocalDateTime.now());
        jobRepository.save(job);

        log.info("Completed validation job: {}", jobId);
        websocketService.notifyJobCompleted(jobId);
    }

    @Transactional(readOnly = true)
    public ValidationJobResponse getJobStatus(String jobId) {
        ValidationJob job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ValidationJobNotFoundException(jobId));
        return mapToResponse(job);
    }

    @Transactional(readOnly = true)
    public List<ValidationJobResponse> getRecentJobs() {
        return jobRepository.findTop10ByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private String generateJobId() {
        return "job-" + UUID.randomUUID().toString().substring(0, 8);
    }

    private ValidationJobResponse mapToResponse(ValidationJob job) {
        return ValidationJobResponse.builder()
                .jobId(job.getId())
                .status(job.getStatus())
                .totalProviders(job.getTotalProviders())
                .completedProviders(job.getCompletedProviders())
                .createdAt(job.getCreatedAt())
                .completedAt(job.getCompletedAt())
                .build();
    }
}
