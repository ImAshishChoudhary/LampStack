package com.healthcare.validation.repository;

import com.healthcare.validation.domain.ValidationJob;
import com.healthcare.validation.domain.enums.JobStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ValidationJobRepository extends JpaRepository<ValidationJob, String> {
    
    List<ValidationJob> findByStatusOrderByCreatedAtDesc(JobStatus status);
    
    List<ValidationJob> findTop10ByOrderByCreatedAtDesc();
}
