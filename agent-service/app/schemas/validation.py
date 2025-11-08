from pydantic import BaseModel
from typing import Optional, Dict, Any

class ValidationRequest(BaseModel):
    job_id: str
    provider_id: int
    npi: str
    name: str
    specialty: str
    state: str

class ValidationResponse(BaseModel):
    job_id: str
    provider_id: int
    status: str
    message: str

class ProgressUpdate(BaseModel):
    job_id: str
    provider_id: int
    stage: str
    status: str
    data: Optional[Dict[str, Any]] = None
