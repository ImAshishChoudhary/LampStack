package com.healthcare.validation.repository;

import com.healthcare.validation.domain.TrustScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TrustScoreRepository extends JpaRepository<TrustScore, Long> {
    
    Optional<TrustScore> findBySourceNameAndFieldName(String sourceName, String fieldName);
    
    Optional<TrustScore> findBySourceName(String sourceName);
}
