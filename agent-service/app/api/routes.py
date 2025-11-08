from fastapi import APIRouter, BackgroundTasks
from app.schemas.validation import ValidationRequest, ValidationResponse
from app.services.orchestrator import ValidationOrchestrator
from app.core.logging import logger

router = APIRouter()

orchestrator = ValidationOrchestrator()

@router.post("/agents/validate", response_model=ValidationResponse)
async def trigger_validation(
    request: ValidationRequest,
    background_tasks: BackgroundTasks
):
    logger.info(f"Received validation request for job_id={request.job_id}, provider_id={request.provider_id}")
    
    background_tasks.add_task(
        orchestrator.execute_validation_workflow,
        request
    )
    
    return ValidationResponse(
        job_id=request.job_id,
        provider_id=request.provider_id,
        status="STARTED",
        message="Validation workflow started"
    )
