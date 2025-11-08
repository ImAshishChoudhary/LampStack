from pymilvus import connections, Collection, FieldSchema, CollectionSchema, DataType, utility
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any
from app.core.config import settings
from app.core.logging import logger
import numpy as np

class VectorStore:
    
    def __init__(self):
        self.embedder = SentenceTransformer('all-MiniLM-L6-v2')
        
        connections.connect(
            alias="default",
            host=settings.MILVUS_HOST,
            port=settings.MILVUS_PORT
        )
        
        self.collection_name = "provider_validations"
        self._create_collection()
        
        logger.info("Vector store initialized with Milvus")
    
    def _create_collection(self):
        if utility.has_collection(self.collection_name):
            self.collection = Collection(self.collection_name)
            logger.info(f"Loaded existing Milvus collection: {self.collection_name}")
            return
        
        fields = [
            FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=True),
            FieldSchema(name="provider_id", dtype=DataType.INT64),
            FieldSchema(name="npi", dtype=DataType.VARCHAR, max_length=10),
            FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=384),
            FieldSchema(name="trust_score", dtype=DataType.FLOAT),
            FieldSchema(name="validation_stage", dtype=DataType.VARCHAR, max_length=50)
        ]
        
        schema = CollectionSchema(fields, description="Provider validation embeddings")
        self.collection = Collection(self.collection_name, schema)
        
        index_params = {
            "metric_type": "COSINE",
            "index_type": "IVF_FLAT",
            "params": {"nlist": 128}
        }
        self.collection.create_index("embedding", index_params)
        
        logger.info(f"Created new Milvus collection: {self.collection_name}")
    
    def store_validation_result(
        self,
        provider_id: int,
        npi: str,
        validation_data: Dict[str, Any]
    ):
        text_data = f"Provider {npi}: {validation_data.get('validation_result', {})}"
        
        embedding = self.embedder.encode(text_data).tolist()
        
        trust_score = validation_data.get("trust_score", {}).get("trust_score", 0.0)
        stage = validation_data.get("current_stage", "unknown")
        
        entities = [
            [provider_id],
            [npi],
            [embedding],
            [float(trust_score)],
            [stage]
        ]
        
        self.collection.insert(entities)
        self.collection.flush()
        
        logger.info(f"Stored validation embedding for provider_id={provider_id} in Milvus")
    
    def search_similar_providers(
        self,
        query: str,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        query_embedding = self.embedder.encode(query).tolist()
        
        search_params = {
            "metric_type": "COSINE",
            "params": {"nprobe": 10}
        }
        
        self.collection.load()
        
        results = self.collection.search(
            data=[query_embedding],
            anns_field="embedding",
            param=search_params,
            limit=top_k,
            output_fields=["provider_id", "npi", "trust_score", "validation_stage"]
        )
        
        similar_providers = []
        for hits in results:
            for hit in hits:
                similar_providers.append({
                    "provider_id": hit.entity.get("provider_id"),
                    "npi": hit.entity.get("npi"),
                    "trust_score": hit.entity.get("trust_score"),
                    "stage": hit.entity.get("validation_stage"),
                    "similarity": hit.score
                })
        
        logger.info(f"Found {len(similar_providers)} similar providers via Milvus")
        return similar_providers
    
    def get_provider_history(self, provider_id: int) -> Dict[str, Any]:
        self.collection.load()
        
        expr = f"provider_id == {provider_id}"
        results = self.collection.query(
            expr=expr,
            output_fields=["npi", "trust_score", "validation_stage"],
            limit=1
        )
        
        if results:
            return {
                "found": True,
                "npi": results[0]["npi"],
                "trust_score": results[0]["trust_score"],
                "stage": results[0]["validation_stage"]
            }
        
        return {"found": False}

vector_store = VectorStore()
