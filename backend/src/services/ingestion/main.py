from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from pathlib import Path

from . import processor

app = FastAPI(title="Table Extractor Service")

# hared mount hogi backend/src/uploads
UPLOAD_ROOT = Path(__file__).resolve().parent.parent / "uploads"


class ProcessRequest(BaseModel):
    file_path: str 


@app.post("/process")
async def process_document(data: ProcessRequest):
    # full path to file
    resolved = UPLOAD_ROOT / data.file_path

    if not resolved.exists():
        raise HTTPException(404, f"File not found: {resolved}")

    try:
        result = processor.process_file(str(resolved))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return JSONResponse(result)
