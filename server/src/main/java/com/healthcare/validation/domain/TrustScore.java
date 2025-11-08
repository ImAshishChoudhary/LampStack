package com.healthcare.validation.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "trust_scores")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrustScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "source_name", nullable = false, length = 100)
    private String sourceName;

    @Column(name = "field_name", length = 100)
    private String fieldName;

    @Column(nullable = false, precision = 3, scale = 2)
    private BigDecimal score;

    @Column(name = "total_validations")
    @Builder.Default
    private Integer totalValidations = 0;

    @Column(name = "correct_validations")
    @Builder.Default
    private Integer correctValidations = 0;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
