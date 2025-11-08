import httpx
from typing import Dict, Any
from app.core.config import settings
from app.core.logging import logger

class JavaServiceClient:
    
    def __init__(self):
        self.base_url = settings.JAVA_SERVICE_URL
        self.timeout = 30.0
    
    async def send_progress_update(
        self,
        job_id: str,
        provider_id: int,
        stage: str,
        status: str,
        data: Dict[str, Any]
    ):
        url = f"{self.base_url}/api/validation/progress"
        
        payload = {
            "jobId": job_id,
            "providerId": provider_id,
            "stage": stage,
            "status": status,
            "data": data
        }
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(url, json=payload)
                response.raise_for_status()
                logger.debug(f"Progress update sent: job_id={job_id}, stage={stage}, status={status}")
        except Exception as e:
            logger.error(f"Failed to send progress update: {e}")
