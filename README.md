# Healthcare Provider Validation System

An intelligent, autonomous system for validating healthcare provider data using multi-agent architecture, machine learning, and real-time data aggregation from multiple authoritative sources.

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Solution Overview](#solution-overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Installation Guide](#installation-guide)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Agent Workflow](#agent-workflow)
- [Database Schema](#database-schema)
- [Contributing](#contributing)
- [License](#license)

---

## Problem Statement

Healthcare provider data is critical for insurance claims, credentialing, and regulatory compliance, but manual validation is plagued with challenges:

**Current Pain Points:**
- Manual cross-referencing across 3+ databases (NPI Registry, State Medical Boards, Google Places)
- High error rates due to inconsistent data formats
- Time-consuming verification process (30+ minutes per provider)
- No standardized trust scoring mechanism
- Lack of automated conflict detection
- Difficulty tracking data provenance

**Business Impact:**
- Delayed provider onboarding
- Increased operational costs
- Compliance risks from outdated credentials
- Poor user experience for provider search

---

## Solution Overview

This system automates provider validation using a **four-agent architecture** orchestrated by LangGraph. Each agent specializes in a specific validation stage, working together to produce a comprehensive trust score with full source attribution.

### Core Capabilities

**1. Automated Data Ingestion**
- Scrapes NPI Registry for federal credentials
- Queries State Medical Boards for license verification
- Enriches contact information via Google Places API
- Parses unstructured documents using Mistral OCR

**2. Cross-Validation & Conflict Detection**
- Compares name, credentials, and addresses across sources
- Flags discrepancies (e.g., expired licenses, mismatched specialties)
- Generates confidence scores per field

**3. Intelligent Enrichment**
- Fills missing phone numbers, emails, and addresses
- Identifies completeness gaps (e.g., missing NPI or taxonomy code)
- Uses fuzzy matching for name variations

**4. Trust Scoring with Source Attribution**
- Weighted scoring: License (35%), Name (25%), Contact (20%), Completeness (20%)
- Final grade: A (90-100%), B (75-89%), C (60-74%), D (50-59%), F (<50%)
- Recommendation: APPROVED, REVIEW, or REJECTED

**5. Human-in-the-Loop Feedback**
- Dashboard for manual review of flagged providers
- Feedback loop improves trust score accuracy over time

---

## Key Features

### Real-Time Validation Workflow
- Upload CSV of providers via frontend
- Trigger validation jobs asynchronously
- Monitor progress via WebSocket updates
- View animated workflow in IdeationCanvas

### Multi-Source Data Aggregation
- **NPI Registry API**: Provider status, taxonomy, demographics
- **State Medical Boards**: License number, expiration, disciplinary actions (web scraping)
- **Google Places API**: Phone, email, address, ratings

### Semantic Search & Pattern Recognition
- Milvus vector database stores validation embeddings
- Find providers with similar validation patterns
- Identify anomalies using cosine similarity

### Versioned Virtual Profiles
- JSONB snapshots track provider data evolution
- Audit trail for compliance and debugging

### Analytics Dashboard
- Trust score distribution
- Validation stage completion rates
- Common conflict types

---

## System Architecture

```
┌─────────────────────┐
│   React Frontend    │
│   (Port 5173)       │
└──────────┬──────────┘
           │ WebSocket
           ▼
┌─────────────────────┐    HTTP Callbacks    ┌─────────────────────┐
│  Java Spring Boot   │◄────────────────────►│  Python FastAPI     │
│  (Port 8080)        │                       │  (Port 5000)        │
│                     │                       │                     │
│ • REST API          │                       │ • LangGraph Agents  │
│ • WebSocket Server  │                       │ • Mistral OCR       │
│ • Job Orchestration │                       │ • Milvus Integration│
└──────────┬──────────┘                       └──────────┬──────────┘
           │                                             │
           ▼                                             ▼
┌─────────────────────┐                       ┌─────────────────────┐
│   PostgreSQL        │                       │   Milvus Vector DB  │
│   (Port 5432)       │                       │   (Port 19530)      │
│                     │                       │                     │
│ • Provider Records  │                       │ • Validation        │
│ • Validation Jobs   │                       │   Embeddings        │
│ • Trust Scores      │                       │ • Semantic Search   │
│ • Virtual Profiles  │                       │                     │
└─────────────────────┘                       └─────────────────────┘
```

### Data Flow

1. **User uploads CSV** → Java parses and stores in PostgreSQL
2. **Java triggers job** → Calls Python agent service via HTTP
3. **Python agents execute** (LangGraph orchestration):
   - Ingestion Agent → Scrapes NPI, State Boards, Google
   - Validation Agent → Cross-checks data for conflicts
   - Enrichment Agent → Fills missing fields
   - Scoring Agent → Calculates trust score
4. **Python stores embeddings** → Milvus for semantic search
5. **Python sends updates** → HTTP callbacks to Java
6. **Java broadcasts** → WebSocket to frontend
7. **Frontend displays** → Real-time workflow visualization

---

## Technology Stack

### Backend (Java Spring Boot 3.2)
| Component | Purpose |
|-----------|---------|
| Spring Data JPA | PostgreSQL ORM |
| Spring WebSocket | Real-time updates |
| RestClient | HTTP communication with Python |
| Jackson | JSON serialization |
| Flyway | Database migrations |
| Lombok | Boilerplate reduction |

### Agent Service (Python 3.11)
| Component | Purpose |
|-----------|---------|
| FastAPI | Async REST framework |
| LangGraph | Multi-agent orchestration |
| Mistral AI | OCR for documents |
| Milvus | Vector database |
| Sentence Transformers | Text embeddings |
| RDKit | (Future) Chemical informatics |
| BeautifulSoup4 | Web scraping |

### Frontend (React 18 + TypeScript)
| Component | Purpose |
|-----------|---------|
| Vite | Build tool |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| React Hook Form | Form validation |
| Zustand | State management |

### Infrastructure
| Component | Purpose |
|-----------|---------|
| Docker Compose | Local development |
| PostgreSQL 15 | Relational database |
| Milvus 2.3 | Vector database |
| Nginx | (Production) Reverse proxy |

---

## Installation Guide

### Prerequisites
- Node.js 18+
- Java 17+
- Maven 3.8+
- Python 3.11+
- Docker Desktop

### Step 1: Clone Repository
```bash
git clone https://github.com/CroWzblooD/LampStack.git
cd LampStack
```

### Step 2: Start Databases
```powershell
docker-compose up -d
docker-compose ps  # Verify PostgreSQL and Milvus are running
```

### Step 3: Configure Backend
```powershell
cd server
mvn clean install
```

Edit `src/main/resources/application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/provider_validation
    username: postgres
    password: password
app:
  python:
    agent-service:
      url: http://localhost:5000
```

Start backend:
```powershell
mvn spring-boot:run
```

### Step 4: Configure Agent Service
```powershell
cd agent-service
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Create `.env` file:
```env
JAVA_SERVICE_URL=http://localhost:8080
MISTRAL_API_KEY=your_mistral_api_key
DATABASE_URL=postgresql://postgres:password@localhost:5432/provider_validation
MILVUS_HOST=localhost
MILVUS_PORT=19530
```

Start agent service:
```powershell
python main.py
```

### Step 5: Configure Frontend
```powershell
cd client
npm install
npm run dev
```

Access application at `http://localhost:5173`

---

## Usage

### Upload Providers
1. Navigate to frontend
2. Click "Upload CSV"
3. Select file with columns: `npi`, `name`, `specialty`, `state`
4. Click "Submit"

### Trigger Validation
1. Go to "Validation Jobs"
2. Click "Start New Job"
3. Select providers to validate
4. Monitor real-time progress in IdeationCanvas

### Review Results
1. Navigate to "Trust Scores"
2. Filter by grade (A-F)
3. View detailed validation report
4. Provide feedback for flagged providers

---

## API Documentation

### Java Backend (Port 8080)

#### Upload Providers
```http
POST /api/providers/upload
Content-Type: multipart/form-data

{
  "file": <CSV file>
}
```

#### Trigger Validation
```http
POST /api/validation/trigger
Content-Type: application/json

{
  "provider_ids": [1, 2, 3]
}
```

#### Get Job Status
```http
GET /api/validation/jobs/{jobId}
```

### Python Agent Service (Port 5000)

#### Validate Provider
```http
POST /api/agents/validate
Content-Type: application/json

{
  "job_id": "uuid",
  "provider_id": 1,
  "npi": "1234567890",
  "name": "Dr. John Doe",
  "specialty": "Cardiology",
  "state": "CA"
}
```

---

## Agent Workflow

### 1. Ingestion Agent
**Responsibility**: Scrape data from external sources

**Data Sources**:
- NPI Registry: `https://npiregistry.cms.hhs.gov/api/?version=2.1&number={npi}`
- State Medical Board: Web scraping (varies by state)
- Google Places: `https://maps.googleapis.com/maps/api/place/findplacefromtext/json`

**Output**:
```json
{
  "npi_data": {...},
  "license_data": {...},
  "contact_data": {...}
}
```

### 2. Validation Agent
**Responsibility**: Cross-check data for conflicts

**Validation Rules**:
- Name match: Fuzzy string matching (>80% similarity)
- License status: Active, Expired, Revoked
- Address consistency: Normalize formats

**Output**:
```json
{
  "conflicts": [
    {
      "field": "license",
      "issue": "Expired on 2024-01-01",
      "severity": "HIGH"
    }
  ],
  "confidence_scores": {
    "name": 0.95,
    "license": 0.60,
    "contact": 0.85
  }
}
```

### 3. Enrichment Agent
**Responsibility**: Fill missing fields

**Enrichment Logic**:
- Missing phone: Use Google Places
- Missing email: Generate based on name + domain
- Missing address: Use NPI primary address

**Output**:
```json
{
  "enriched_fields": {
    "phone": "+1-555-1234",
    "email": "john.doe@example.com"
  },
  "completeness": 0.85
}
```

### 4. Scoring Agent
**Responsibility**: Calculate final trust score

**Scoring Formula**:
```
Trust Score = (License × 0.35) + (Name × 0.25) + (Contact × 0.20) + (Completeness × 0.20)
```

**Output**:
```json
{
  "trust_score": 0.82,
  "grade": "B",
  "recommendation": "APPROVED",
  "source_reliability": {
    "npi": 0.95,
    "state_board": 0.92,
    "google_places": 0.70
  }
}
```

---

## Database Schema

### PostgreSQL Tables

**providers**
```sql
CREATE TABLE providers (
  id SERIAL PRIMARY KEY,
  npi VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  specialty VARCHAR(100),
  state VARCHAR(2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**validation_jobs**
```sql
CREATE TABLE validation_jobs (
  id UUID PRIMARY KEY,
  status VARCHAR(50),
  started_at TIMESTAMP,
  completed_at TIMESTAMP
);
```

**validations**
```sql
CREATE TABLE validations (
  id SERIAL PRIMARY KEY,
  job_id UUID REFERENCES validation_jobs(id),
  provider_id INTEGER REFERENCES providers(id),
  stage VARCHAR(50),
  status VARCHAR(50),
  result JSONB
);
```

**trust_scores**
```sql
CREATE TABLE trust_scores (
  id SERIAL PRIMARY KEY,
  provider_id INTEGER REFERENCES providers(id),
  trust_score DECIMAL(3,2),
  grade CHAR(1),
  recommendation VARCHAR(20),
  source_reliability JSONB
);
```

**virtual_profiles**
```sql
CREATE TABLE virtual_profiles (
  id SERIAL PRIMARY KEY,
  provider_id INTEGER REFERENCES providers(id),
  version INTEGER,
  snapshot JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Milvus Collection

**validation_embeddings**
```python
schema = CollectionSchema([
  FieldSchema("id", DataType.INT64, is_primary=True),
  FieldSchema("provider_id", DataType.INT64),
  FieldSchema("npi", DataType.VARCHAR, max_length=10),
  FieldSchema("embedding", DataType.FLOAT_VECTOR, dim=384),
  FieldSchema("trust_score", DataType.FLOAT),
  FieldSchema("validation_stage", DataType.VARCHAR, max_length=50)
])
```

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit changes (`git commit -m "Add your feature"`)
4. Push to branch (`git push origin feature/your-feature`)
5. Open a pull request

**Code Style**:
- Java: Google Java Style Guide
- Python: PEP 8
- TypeScript: ESLint + Prettier

**Testing**:
- Write unit tests for new features
- Ensure all tests pass before submitting PR

---

## License

MIT License

Copyright (c) 2025

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files, to deal in the Software
without restriction, including without limitation the rights to use, copy,
modify, merge, publish, distribute, sublicense, and/or sell copies of the
Software.

---

## Acknowledgments

- NPI Registry for provider data
- State Medical Boards for licensing information
- Mistral AI for OCR capabilities
- LangGraph for multi-agent orchestration
- Milvus community for vector database support

---

**Built with passion for healthcare data integrity**
