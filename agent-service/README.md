# Provider Validation Agent Service

Python FastAPI microservice for autonomous healthcare provider data validation using multi-agent architecture.

## Architecture

- **FastAPI** - Async REST API framework
- **LangGraph** - Multi-agent workflow orchestration with state management
- **ChromaDB** - Vector database for semantic search and provider history
- **Java Integration** - HTTP callbacks for real-time progress

## Agents

1. **Data Ingestion Agent** - Scrapes NPI Registry, State Medical Boards, Google Places
2. **Cross-Validation Agent** - Validates consistency across sources, detects conflicts
3. **Enrichment Agent** - Fills missing fields using third-party APIs
4. **Trust Scoring Agent** - Calculates weighted reliability scores with source attribution

## Installation

```bash
pip install -r requirements.txt
```

## Configuration

Create `.env` file:
```
JAVA_SERVICE_URL=http://localhost:8080
OPENAI_API_KEY=your_key
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgresql://postgres:password@localhost:5432/provider_validation
LOG_LEVEL=INFO
```

## Run

```bash
python main.py
```

Server runs on `http://localhost:5000`

## API Endpoints

- `POST /api/agents/validate` - Trigger validation workflow
- `GET /health` - Health check

## Workflow

1. Receive validation request from Java service
2. Execute agents sequentially: Ingestion → Validation → Enrichment → Scoring
3. Send progress updates to Java via HTTP callbacks after each stage
4. Java broadcasts updates to React frontend via WebSocket for real-time visualization

## Data Sources

- **NPI Registry** (https://npiregistry.cms.hhs.gov/api) - Provider status, taxonomy, demographics
- **State Medical Boards** (Web scraping) - License status, expiration, disciplinary actions
- **Google Places API** (Future) - Phone, email, address verification

## Tech Stack (All FREE)

- Python 3.11+
- FastAPI (REST API)
- LangGraph (Agent orchestration - matches diagram)
- **Milvus** (Vector database - as per solution design)
- **Mistral AI** (OCR for unstructured documents - as per diagram)
- Sentence Transformers (Embeddings - all-MiniLM-L6-v2)
- httpx (Async HTTP client)
- BeautifulSoup4 (Web scraping)
- PostgreSQL (Relational DB - Digital Twin Store)

## Architecture Components (From Solution Design)

1. **Unstructured Data Parsing** - Mistral OCR (parseable, scanned docs)
2. **Cleaning Algorithms** - Fuzzy matching, regex, normalization
3. **Digital Twin Store** - PostgreSQL (structured JSON) + Milvus (vectors)
4. **LangGraph Agents**:
   - Validator Agent
   - Enrichment Agent  
   - Cross-Reference Agent
5. **Trust Score Matrix** - Self-prioritization learning loop
6. **Human-in-Loop Review** - Analytics dashboard feedback
