from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
import operator

class ValidationState(TypedDict):
    job_id: str
    provider_id: int
    npi: str
    name: str
    specialty: str
    state: str
    ingested_data: dict
    validation_result: dict
    enrichment_result: dict
    trust_score: dict
    errors: Annotated[list, operator.add]
    current_stage: str

class LangGraphOrchestrator:
    
    def __init__(self):
        self.workflow = self._build_workflow()
    
    def _build_workflow(self) -> StateGraph:
        workflow = StateGraph(ValidationState)
        
        workflow.add_node("ingestion", self._ingestion_node)
        workflow.add_node("validation", self._validation_node)
        workflow.add_node("enrichment", self._enrichment_node)
        workflow.add_node("scoring", self._scoring_node)
        
        workflow.set_entry_point("ingestion")
        
        workflow.add_edge("ingestion", "validation")
        workflow.add_edge("validation", "enrichment")
        workflow.add_edge("enrichment", "scoring")
        workflow.add_edge("scoring", END)
        
        return workflow.compile()
    
    async def _ingestion_node(self, state: ValidationState) -> ValidationState:
        from app.services.agents.ingestion_agent import DataIngestionAgent
        from app.schemas.validation import ValidationRequest
        
        agent = DataIngestionAgent()
        request = ValidationRequest(
            job_id=state["job_id"],
            provider_id=state["provider_id"],
            npi=state["npi"],
            name=state["name"],
            specialty=state["specialty"],
            state=state["state"]
        )
        
        state["ingested_data"] = await agent.scrape_all_sources(request)
        state["current_stage"] = "ingestion_completed"
        return state
    
    async def _validation_node(self, state: ValidationState) -> ValidationState:
        from app.services.agents.validation_agent import CrossValidationAgent
        from app.schemas.validation import ValidationRequest
        
        agent = CrossValidationAgent()
        request = ValidationRequest(
            job_id=state["job_id"],
            provider_id=state["provider_id"],
            npi=state["npi"],
            name=state["name"],
            specialty=state["specialty"],
            state=state["state"]
        )
        
        state["validation_result"] = await agent.validate(state["ingested_data"], request)
        state["current_stage"] = "validation_completed"
        return state
    
    async def _enrichment_node(self, state: ValidationState) -> ValidationState:
        from app.services.agents.enrichment_agent import EnrichmentAgent
        from app.schemas.validation import ValidationRequest
        
        agent = EnrichmentAgent()
        request = ValidationRequest(
            job_id=state["job_id"],
            provider_id=state["provider_id"],
            npi=state["npi"],
            name=state["name"],
            specialty=state["specialty"],
            state=state["state"]
        )
        
        state["enrichment_result"] = await agent.enrich(state["validation_result"], request)
        state["current_stage"] = "enrichment_completed"
        return state
    
    async def _scoring_node(self, state: ValidationState) -> ValidationState:
        from app.services.agents.scoring_agent import ScoringAgent
        
        agent = ScoringAgent()
        state["trust_score"] = await agent.calculate_trust_score(state["enrichment_result"])
        state["current_stage"] = "scoring_completed"
        return state
    
    async def execute(self, initial_state: ValidationState) -> ValidationState:
        result = await self.workflow.ainvoke(initial_state)
        return result
