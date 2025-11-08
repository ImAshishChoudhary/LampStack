from typing import Dict, Any
from app.schemas.validation import ValidationRequest
from app.services.langgraph_orchestrator import LangGraphOrchestrator, ValidationState
from app.services.vector_store import vector_store
from app.services.java_client import JavaServiceClient
from app.core.logging import logger

class ValidationOrchestrator:
    
    def __init__(self):
        self.langgraph = LangGraphOrchestrator()
        self.java_client = JavaServiceClient()
    
    async def execute_validation_workflow(self, request: ValidationRequest):
        logger.info(f"Starting LangGraph validation workflow for provider_id={request.provider_id}")
        
        initial_state: ValidationState = {
            "job_id": request.job_id,
            "provider_id": request.provider_id,
            "npi": request.npi,
            "name": request.name,
            "specialty": request.specialty,
            "state": request.state,
            "ingested_data": {},
            "validation_result": {},
            "enrichment_result": {},
            "trust_score": {},
            "errors": [],
            "current_stage": "started"
        }
        
        await self.notify_progress(request.job_id, request.provider_id, "workflow", "STARTED")
        
        final_state = await self.langgraph.execute(initial_state)
        
        await self.notify_progress(
            request.job_id,
            request.provider_id,
            "data_ingestion",
            "COMPLETED",
            final_state["ingested_data"]
        )
        
        await self.notify_progress(
            request.job_id,
            request.provider_id,
            "cross_validation",
            "COMPLETED",
            final_state["validation_result"]
        )
        
        await self.notify_progress(
            request.job_id,
            request.provider_id,
            "enrichment",
            "COMPLETED",
            final_state["enrichment_result"]
        )
        
        await self.notify_progress(
            request.job_id,
            request.provider_id,
            "trust_scoring",
            "COMPLETED",
            final_state["trust_score"]
        )
        
        vector_store.store_validation_result(
            provider_id=request.provider_id,
            npi=request.npi,
            validation_data=final_state
        )
        
        logger.info(f"Completed LangGraph workflow for provider_id={request.provider_id}")
    
    async def notify_progress(
        self, 
        job_id: str, 
        provider_id: int, 
        stage: str, 
        status: str,
        data: Dict[str, Any] = None
    ):
        await self.java_client.send_progress_update(
            job_id=job_id,
            provider_id=provider_id,
            stage=stage,
            status=status,
            data=data or {}
        )
