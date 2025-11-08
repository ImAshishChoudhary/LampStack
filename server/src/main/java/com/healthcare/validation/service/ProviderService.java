package com.healthcare.validation.service;

import com.healthcare.validation.domain.Provider;
import com.healthcare.validation.dto.ProviderResponse;
import com.healthcare.validation.dto.ProviderUploadRequest;
import com.healthcare.validation.exception.DuplicateProviderException;
import com.healthcare.validation.exception.ProviderNotFoundException;
import com.healthcare.validation.repository.ProviderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProviderService {

    private final ProviderRepository providerRepository;
    private final CsvParserService csvParserService;

    @Transactional
    public List<ProviderResponse> uploadProviders(MultipartFile file) {
        List<ProviderUploadRequest> requests = csvParserService.parseCsv(file);
        List<ProviderResponse> responses = new ArrayList<>();

        for (ProviderUploadRequest request : requests) {
            if (providerRepository.existsByNpi(request.getNpi())) {
                log.warn("Duplicate NPI found: {}", request.getNpi());
                continue;
            }

            Provider provider = createProviderFromRequest(request);
            Provider saved = providerRepository.save(provider);
            responses.add(mapToResponse(saved));
        }

        log.info("Successfully uploaded {} providers", responses.size());
        return responses;
    }

    @Transactional(readOnly = true)
    public List<ProviderResponse> getAllProviders() {
        return providerRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProviderResponse getProviderById(Long id) {
        Provider provider = providerRepository.findById(id)
                .orElseThrow(() -> new ProviderNotFoundException(id));
        return mapToResponse(provider);
    }

    @Transactional(readOnly = true)
    public ProviderResponse getProviderByNpi(String npi) {
        Provider provider = providerRepository.findByNpi(npi)
                .orElseThrow(() -> new ProviderNotFoundException(npi));
        return mapToResponse(provider);
    }

    @Transactional
    public ProviderResponse createProvider(ProviderUploadRequest request) {
        if (providerRepository.existsByNpi(request.getNpi())) {
            throw new DuplicateProviderException(request.getNpi());
        }

        Provider provider = createProviderFromRequest(request);
        Provider saved = providerRepository.save(provider);
        log.info("Created provider with NPI: {}", saved.getNpi());
        return mapToResponse(saved);
    }

    @Transactional
    public ProviderResponse updateProvider(Long id, ProviderUploadRequest request) {
        Provider provider = providerRepository.findById(id)
                .orElseThrow(() -> new ProviderNotFoundException(id));

        updateProviderFields(provider, request);
        Provider updated = providerRepository.save(provider);
        log.info("Updated provider with ID: {}", id);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteProvider(Long id) {
        if (!providerRepository.existsById(id)) {
            throw new ProviderNotFoundException(id);
        }
        providerRepository.deleteById(id);
        log.info("Deleted provider with ID: {}", id);
    }

    private Provider createProviderFromRequest(ProviderUploadRequest request) {
        return Provider.builder()
                .npi(request.getNpi())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .specialty(request.getSpecialty())
                .state(request.getState())
                .address(request.getAddress())
                .city(request.getCity())
                .zipCode(request.getZipCode())
                .phone(request.getPhone())
                .email(request.getEmail())
                .build();
    }

    private void updateProviderFields(Provider provider, ProviderUploadRequest request) {
        provider.setFirstName(request.getFirstName());
        provider.setLastName(request.getLastName());
        provider.setSpecialty(request.getSpecialty());
        provider.setState(request.getState());
        provider.setAddress(request.getAddress());
        provider.setCity(request.getCity());
        provider.setZipCode(request.getZipCode());
        provider.setPhone(request.getPhone());
        provider.setEmail(request.getEmail());
    }

    private ProviderResponse mapToResponse(Provider provider) {
        return ProviderResponse.builder()
                .id(provider.getId())
                .npi(provider.getNpi())
                .firstName(provider.getFirstName())
                .lastName(provider.getLastName())
                .specialty(provider.getSpecialty())
                .state(provider.getState())
                .address(provider.getAddress())
                .city(provider.getCity())
                .zipCode(provider.getZipCode())
                .phone(provider.getPhone())
                .email(provider.getEmail())
                .createdAt(provider.getCreatedAt())
                .updatedAt(provider.getUpdatedAt())
                .build();
    }
}
