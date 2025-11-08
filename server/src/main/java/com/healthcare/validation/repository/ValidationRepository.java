package com.healthcare.validation.repository;

import com.healthcare.validation.domain.Provider;
import com.healthcare.validation.domain.Validation;
import com.healthcare.validation.domain.ValidationJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ValidationRepository extends JpaRepository<Validation, Long> {
    
    List<Validation> findByJob(ValidationJob job);
    
    List<Validation> findByProvider(Provider provider);
    
    List<Validation> findByJobAndProvider(ValidationJob job, Provider provider);
}
