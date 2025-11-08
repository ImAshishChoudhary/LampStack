package com.healthcare.validation.service;

import com.healthcare.validation.domain.enums.JobStatus;
import com.healthcare.validation.dto.ProgressUpdate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class WebSocketNotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public void notifyJobCreated(String jobId) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", "JOB_CREATED");
        message.put("jobId", jobId);
        message.put("status", "QUEUED");

        sendToJob(jobId, message);
        log.debug("Notified job created: {}", jobId);
    }

    public void notifyJobStatusChanged(String jobId, JobStatus status) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", "STATUS_CHANGED");
        message.put("jobId", jobId);
        message.put("status", status.name());

        sendToJob(jobId, message);
        log.debug("Notified status change for job {}: {}", jobId, status);
    }

    public void notifyJobProgress(String jobId, Integer completed, Integer total) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", "PROGRESS_UPDATE");
        message.put("jobId", jobId);
        message.put("completed", completed);
        message.put("total", total);
        message.put("percentage", (completed * 100) / total);

        sendToJob(jobId, message);
        log.debug("Notified progress for job {}: {}/{}", jobId, completed, total);
    }

    public void notifyJobCompleted(String jobId) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", "JOB_COMPLETED");
        message.put("jobId", jobId);
        message.put("status", "COMPLETED");

        sendToJob(jobId, message);
        log.debug("Notified job completed: {}", jobId);
    }

    public void notifyValidationProgress(ProgressUpdate update) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", "VALIDATION_PROGRESS");
        message.put("jobId", update.getJobId());
        message.put("providerId", update.getProviderId());
        message.put("stage", update.getStage());
        message.put("status", update.getStatus());
        message.put("data", update.getData());

        sendToJob(update.getJobId(), message);
        log.debug("Notified validation progress for job {}: stage={}", update.getJobId(), update.getStage());
    }

    private void sendToJob(String jobId, Object message) {
        messagingTemplate.convertAndSend("/topic/job/" + jobId, message);
    }

    public void broadcastToAll(Object message) {
        messagingTemplate.convertAndSend("/topic/broadcast", message);
    }
}
