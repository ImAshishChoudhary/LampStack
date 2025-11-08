from mistralai.client import MistralClient
from mistralai.models.chat_completion import ChatMessage
from typing import Dict, Any
from app.core.config import settings
from app.core.logging import logger

class MistralOCRService:
    
    def __init__(self):
        self.client = MistralClient(api_key=settings.MISTRAL_API_KEY)
        logger.info("Mistral OCR service initialized")
    
    async def parse_unstructured_document(self, document_text: str) -> Dict[str, Any]:
        logger.info("Parsing unstructured document with Mistral OCR")
        
        messages = [
            ChatMessage(
                role="system",
                content="You are a medical document parser. Extract provider information from unstructured text and return structured JSON with fields: npi, name, specialty, state, license, phone, email."
            ),
            ChatMessage(
                role="user",
                content=f"Parse this provider document:\n\n{document_text}"
            )
        ]
        
        response = self.client.chat(
            model="mistral-small-latest",
            messages=messages,
            response_format={"type": "json_object"}
        )
        
        parsed_data = response.choices[0].message.content
        
        logger.info("Successfully parsed document with Mistral OCR")
        return parsed_data
    
    async def extract_scanned_data(self, image_base64: str) -> Dict[str, Any]:
        logger.info("Extracting data from scanned document")
        
        messages = [
            ChatMessage(
                role="system",
                content="Extract provider information from this scanned medical document image."
            ),
            ChatMessage(
                role="user",
                content=[
                    {
                        "type": "image_url",
                        "image_url": f"data:image/jpeg;base64,{image_base64}"
                    }
                ]
            )
        ]
        
        response = self.client.chat(
            model="pixtral-12b-latest",
            messages=messages
        )
        
        extracted_data = response.choices[0].message.content
        
        logger.info("Successfully extracted scanned document data")
        return extracted_data

mistral_ocr = MistralOCRService()
