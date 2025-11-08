package com.healthcare.validation.controller;

import com.healthcare.validation.dto.ProviderResponse;
import com.healthcare.validation.dto.ProviderUploadRequest;
import com.healthcare.validation.service.ProviderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/providers")
@RequiredArgsConstructor
public class ProviderController {

    private final ProviderService providerService;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadCsv(@RequestParam("file") MultipartFile file) {
        List<ProviderResponse> providers = providerService.uploadProviders(file);
        
        return ResponseEntity.ok(Map.of(
                "message", "Providers uploaded successfully",
                "count", providers.size(),
                "providers", providers
        ));
    }

    @GetMapping
    public ResponseEntity<List<ProviderResponse>> getAllProviders() {
        return ResponseEntity.ok(providerService.getAllProviders());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProviderResponse> getProviderById(@PathVariable Long id) {
        return ResponseEntity.ok(providerService.getProviderById(id));
    }

    @GetMapping("/npi/{npi}")
    public ResponseEntity<ProviderResponse> getProviderByNpi(@PathVariable String npi) {
        return ResponseEntity.ok(providerService.getProviderByNpi(npi));
    }

    @PostMapping
    public ResponseEntity<ProviderResponse> createProvider(@RequestBody ProviderUploadRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(providerService.createProvider(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProviderResponse> updateProvider(
            @PathVariable Long id,
            @RequestBody ProviderUploadRequest request) {
        return ResponseEntity.ok(providerService.updateProvider(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProvider(@PathVariable Long id) {
        providerService.deleteProvider(id);
        return ResponseEntity.noContent().build();
    }
}
