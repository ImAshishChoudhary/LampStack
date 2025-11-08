package com.healthcare.validation.repository;

import com.healthcare.validation.domain.Feedback;
import com.healthcare.validation.domain.Validation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    
    List<Feedback> findByValidation(Validation validation);
}
