package com.healthcare.validation.controller;

import com.healthcare.validation.dto.ProgressUpdate;
import com.healthcare.validation.dto.ValidationJobResponse;
import com.healthcare.validation.dto.ValidationTriggerRequest;
import com.healthcare.validation.service.ValidationOrchestrator;
import com.healthcare.validation.service.WebSocketNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/validation")
@RequiredArgsConstructor
public class ValidationController {

    private final ValidationOrchestrator validationOrchestrator;
    private final WebSocketNotificationService websocketService;

    @PostMapping("/trigger")
    public ResponseEntity<ValidationJobResponse> triggerValidation(
            @RequestBody ValidationTriggerRequest request) {
        ValidationJobResponse response = validationOrchestrator.triggerValidation(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/jobs/{jobId}")
    public ResponseEntity<ValidationJobResponse> getJobStatus(@PathVariable String jobId) {
        return ResponseEntity.ok(validationOrchestrator.getJobStatus(jobId));
    }

    @GetMapping("/jobs")
    public ResponseEntity<List<ValidationJobResponse>> getRecentJobs() {
        return ResponseEntity.ok(validationOrchestrator.getRecentJobs());
    }

    @PostMapping("/progress")
    public ResponseEntity<Void> receiveProgressUpdate(@RequestBody ProgressUpdate update) {
        websocketService.notifyValidationProgress(update);
        return ResponseEntity.ok().build();
    }
}
