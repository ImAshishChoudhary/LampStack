package com.healthcare.validation.service;

import com.healthcare.validation.domain.TrustScore;
import com.healthcare.validation.repository.TrustScoreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TrustScoreService {

    private final TrustScoreRepository trustScoreRepository;

    @Transactional(readOnly = true)
    public List<TrustScore> getAllScores() {
        return trustScoreRepository.findAll();
    }

    @Transactional(readOnly = true)
    public BigDecimal getScoreForSource(String sourceName, String fieldName) {
        return trustScoreRepository.findBySourceNameAndFieldName(sourceName, fieldName)
                .map(TrustScore::getScore)
                .orElse(BigDecimal.valueOf(0.50));
    }

    @Transactional
    public void updateScoreWithFeedback(String sourceName, String fieldName, boolean isCorrect) {
        TrustScore score = trustScoreRepository.findBySourceNameAndFieldName(sourceName, fieldName)
                .orElseGet(() -> createInitialScore(sourceName, fieldName));

        score.setTotalValidations(score.getTotalValidations() + 1);
        
        if (isCorrect) {
            score.setCorrectValidations(score.getCorrectValidations() + 1);
        }

        BigDecimal newScore = calculateScore(score.getCorrectValidations(), score.getTotalValidations());
        score.setScore(newScore);

        trustScoreRepository.save(score);
        log.info("Updated trust score for {}/{}: {}", sourceName, fieldName, newScore);
    }

    @Transactional
    public void initializeDefaultScores() {
        createScoreIfNotExists("npi_registry", "status", BigDecimal.valueOf(0.95));
        createScoreIfNotExists("npi_registry", "demographics", BigDecimal.valueOf(0.90));
        createScoreIfNotExists("state_medical_board", "license", BigDecimal.valueOf(0.95));
        createScoreIfNotExists("state_medical_board", "disciplinary", BigDecimal.valueOf(0.92));
        createScoreIfNotExists("google_places", "phone", BigDecimal.valueOf(0.70));
        createScoreIfNotExists("google_places", "address", BigDecimal.valueOf(0.65));
        
        log.info("Initialized default trust scores");
    }

    private TrustScore createInitialScore(String sourceName, String fieldName) {
        return TrustScore.builder()
                .sourceName(sourceName)
                .fieldName(fieldName)
                .score(BigDecimal.valueOf(0.50))
                .totalValidations(0)
                .correctValidations(0)
                .build();
    }

    private void createScoreIfNotExists(String sourceName, String fieldName, BigDecimal initialScore) {
        if (trustScoreRepository.findBySourceNameAndFieldName(sourceName, fieldName).isEmpty()) {
            TrustScore score = TrustScore.builder()
                    .sourceName(sourceName)
                    .fieldName(fieldName)
                    .score(initialScore)
                    .totalValidations(0)
                    .correctValidations(0)
                    .build();
            trustScoreRepository.save(score);
        }
    }

    private BigDecimal calculateScore(Integer correct, Integer total) {
        if (total == 0) {
            return BigDecimal.valueOf(0.50);
        }
        return BigDecimal.valueOf(correct)
                .divide(BigDecimal.valueOf(total), 2, RoundingMode.HALF_UP);
    }
}
