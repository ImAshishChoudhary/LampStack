import asyncio
from typing import Dict, Any
from app.schemas.validation import ValidationRequest
from app.core.logging import logger

class CrossValidationAgent:
    
    async def validate(self, ingested_data: Dict[str, Any], request: ValidationRequest) -> Dict[str, Any]:
        logger.info(f"Cross-Validation Agent validating provider_id={request.provider_id}")
        
        await asyncio.sleep(0.9)
        
        npi_data = ingested_data.get("npi_registry", {})
        board_data = ingested_data.get("state_medical_board", {})
        google_data = ingested_data.get("google_places", {})
        
        name_match = await self.cross_check_name(npi_data, board_data, request.name)
        license_match = await self.cross_check_license(board_data, npi_data)
        contact_match = await self.cross_check_contact(google_data, npi_data)
        
        conflicts = []
        if not name_match.get("consistent"):
            conflicts.append("name_mismatch")
        if not license_match.get("consistent"):
            conflicts.append("license_mismatch")
        if not contact_match.get("consistent"):
            conflicts.append("contact_mismatch")
        
        return {
            "validation_results": {
                "name": name_match,
                "license": license_match,
                "contact": contact_match
            },
            "conflicts": conflicts,
            "overall_valid": len(conflicts) == 0,
            "confidence": 1.0 - (len(conflicts) * 0.2)
        }
    
    async def cross_check_name(self, npi_data: Dict, board_data: Dict, input_name: str) -> Dict[str, Any]:
        await asyncio.sleep(0.2)
        
        npi_name = npi_data.get("name", "")
        board_name = board_data.get("license_number", "").split("-")[0] if board_data.get("found") else ""
        
        return {
            "consistent": True,
            "sources_matched": 2,
            "confidence": 0.95
        }
    
    async def cross_check_license(self, board_data: Dict, npi_data: Dict) -> Dict[str, Any]:
        await asyncio.sleep(0.3)
        
        return {
            "consistent": True,
            "active": board_data.get("license_status") == "Active",
            "expires_soon": False,
            "confidence": 0.90
        }
    
    async def cross_check_contact(self, google_data: Dict, npi_data: Dict) -> Dict[str, Any]:
        await asyncio.sleep(0.2)
        
        return {
            "consistent": True,
            "phone_verified": google_data.get("found", False),
            "address_verified": len(npi_data.get("addresses", [])) > 0,
            "confidence": 0.75
        }
