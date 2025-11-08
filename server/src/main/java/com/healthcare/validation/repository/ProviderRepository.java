package com.healthcare.validation.repository;

import com.healthcare.validation.domain.Provider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProviderRepository extends JpaRepository<Provider, Long> {
    
    Optional<Provider> findByNpi(String npi);
    
    boolean existsByNpi(String npi);
}
