package com.healthcare.validation.service;

import com.healthcare.validation.dto.ProviderUploadRequest;
import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class CsvParserService {

    public List<ProviderUploadRequest> parseCsv(MultipartFile file) {
        List<ProviderUploadRequest> providers = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()));
             CSVReader csvReader = new CSVReader(reader)) {

            List<String[]> records = csvReader.readAll();
            
            if (records.isEmpty()) {
                return providers;
            }

            records.remove(0);

            for (String[] record : records) {
                if (record.length < 10) {
                    log.warn("Skipping invalid row with {} columns", record.length);
                    continue;
                }

                ProviderUploadRequest provider = ProviderUploadRequest.builder()
                        .npi(record[0].trim())
                        .firstName(record[1].trim())
                        .lastName(record[2].trim())
                        .specialty(record[3].trim())
                        .state(record[4].trim())
                        .address(record[5].trim())
                        .city(record[6].trim())
                        .zipCode(record[7].trim())
                        .phone(record[8].trim())
                        .email(record[9].trim())
                        .build();

                providers.add(provider);
            }

            log.info("Parsed {} providers from CSV", providers.size());

        } catch (IOException | CsvException e) {
            log.error("Error parsing CSV file", e);
            throw new RuntimeException("Failed to parse CSV file", e);
        }

        return providers;
    }
}
