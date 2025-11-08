import asyncio
from typing import Dict, Any
from app.core.logging import logger

class ScoringAgent:
    
    async def calculate_trust_score(self, enrichment_result: Dict[str, Any]) -> Dict[str, Any]:
        logger.info("Scoring Agent calculating weighted trust scores")
        
        await asyncio.sleep(0.4)
        
        validation_data = enrichment_result.get("original_validation", {})
        
        source_scores = await self.calculate_source_reliability()
        field_scores = await self.calculate_field_scores(validation_data, enrichment_result)
        overall_trust = await self.calculate_overall_trust(source_scores, field_scores)
        
        return {
            "trust_score": overall_trust,
            "source_reliability": source_scores,
            "field_scores": field_scores,
            "grade": self.get_grade(overall_trust),
            "recommendation": self.get_recommendation(overall_trust),
            "human_review_required": overall_trust < 0.75
        }
    
    async def calculate_source_reliability(self) -> Dict[str, float]:
        await asyncio.sleep(0.1)
        
        return {
            "npi_registry": 0.95,
            "state_medical_board": 0.92,
            "google_places": 0.70,
            "third_party_api": 0.65
        }
    
    async def calculate_field_scores(self, validation_data: Dict, enrichment_data: Dict) -> Dict[str, float]:
        await asyncio.sleep(0.2)
        
        validation_results = validation_data.get("validation_results", {})
        
        return {
            "name_accuracy": validation_results.get("name", {}).get("confidence", 0.0),
            "license_validity": validation_results.get("license", {}).get("confidence", 0.0),
            "contact_accuracy": validation_results.get("contact", {}).get("confidence", 0.0),
            "data_completeness": enrichment_data.get("final_completeness", 0.0)
        }
    
    async def calculate_overall_trust(self, source_scores: Dict, field_scores: Dict) -> float:
        await asyncio.sleep(0.1)
        
        weighted_sum = (
            field_scores.get("name_accuracy", 0) * 0.25 +
            field_scores.get("license_validity", 0) * 0.35 +
            field_scores.get("contact_accuracy", 0) * 0.20 +
            field_scores.get("data_completeness", 0) * 0.20
        )
        
        return round(weighted_sum, 2)
    
    def get_grade(self, score: float) -> str:
        if score >= 0.9:
            return "A"
        elif score >= 0.8:
            return "B"
        elif score >= 0.7:
            return "C"
        elif score >= 0.6:
            return "D"
        else:
            return "F"
    
    def get_recommendation(self, score: float) -> str:
        if score >= 0.8:
            return "APPROVED"
        elif score >= 0.6:
            return "REVIEW"
        else:
            return "REJECTED"
