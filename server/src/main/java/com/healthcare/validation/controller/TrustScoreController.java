package com.healthcare.validation.controller;

import com.healthcare.validation.domain.TrustScore;
import com.healthcare.validation.service.TrustScoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trust")
@RequiredArgsConstructor
public class TrustScoreController {

    private final TrustScoreService trustScoreService;

    @GetMapping("/scores")
    public ResponseEntity<List<TrustScore>> getAllScores() {
        return ResponseEntity.ok(trustScoreService.getAllScores());
    }

    @GetMapping("/score")
    public ResponseEntity<Map<String, BigDecimal>> getScore(
            @RequestParam String source,
            @RequestParam String field) {
        BigDecimal score = trustScoreService.getScoreForSource(source, field);
        return ResponseEntity.ok(Map.of("score", score));
    }

    @PostMapping("/feedback")
    public ResponseEntity<Void> submitFeedback(
            @RequestParam String source,
            @RequestParam String field,
            @RequestParam boolean correct) {
        trustScoreService.updateScoreWithFeedback(source, field, correct);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/initialize")
    public ResponseEntity<Void> initializeDefaultScores() {
        trustScoreService.initializeDefaultScores();
        return ResponseEntity.ok().build();
    }
}
