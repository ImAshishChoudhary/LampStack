package com.healthcare.validation.service;

import com.healthcare.validation.dto.AgentValidationRequest;
import com.healthcare.validation.dto.AgentValidationResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
@RequiredArgsConstructor
public class PythonAgentClient {

    private final RestTemplate restTemplate;

    @Value("${app.python.agent-service.url}")
    private String pythonServiceUrl;

    public AgentValidationResponse triggerValidation(AgentValidationRequest request) {
        String url = pythonServiceUrl + "/api/agents/validate";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<AgentValidationRequest> entity = new HttpEntity<>(request, headers);

        try {
            log.info("Calling Python agent service for provider: {}", request.getProviderId());
            
            ResponseEntity<AgentValidationResponse> response = restTemplate.postForEntity(
                    url,
                    entity,
                    AgentValidationResponse.class
            );

            log.info("Received response from Python agent service: {}", response.getStatusCode());
            return response.getBody();

        } catch (Exception e) {
            log.error("Error calling Python agent service: {}", e.getMessage());
            throw new RuntimeException("Failed to communicate with Python agent service", e);
        }
    }
}
