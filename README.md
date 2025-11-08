# LampStack

<div align="center">

![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-6DB33F?style=for-the-badge&logo=spring&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Milvus](https://img.shields.io/badge/Milvus-2.3-00A1EA?style=for-the-badge&logo=milvus&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-0.1.20-121212?style=for-the-badge&logo=chainlink&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)

**Autonomous Healthcare Provider Data Validation Platform**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](http://makeapullrequest.com)

</div>

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Solution Overview](#solution-overview)
- [Methodology](#methodology)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Agent Workflow](#agent-workflow)
- [Performance Metrics](#performance-metrics)
- [Contributing](#contributing)
- [License](#license)

---

## Problem Statement

Healthcare provider data accuracy remains a critical challenge in the medical industry, with significant financial and operational impacts:

**Financial Impact**
- $2 billion lost annually due to incorrect or outdated provider data
- 10-15% error rates in provider information across healthcare systems
- Average 2-3 days manual validation time per provider record

**Operational Challenges**
- Manual cross-referencing required across multiple databases (NPI Registry, State Medical Boards, Google Places API)
- Inconsistent data formats between different authoritative sources
- No standardized trust scoring or quality metrics
- Difficulty in detecting duplicate or conflicting provider records
- Poor scalability when validating thousands of providers
- Lack of automated conflict resolution mechanisms

**Compliance Risks**
- Regulatory compliance issues from outdated credentials
- Provider credentialing delays impacting operations
- Incomplete audit trails for data validation processes

---

## Solution Overview

LampStack is an autonomous platform that validates healthcare provider data through a multi-agent AI architecture orchestrated by LangGraph. The system processes both structured (CSV) and unstructured (PDF, images) data formats to ensure comprehensive validation across multiple authoritative sources.

**Core Capabilities**

The platform implements a four-layer validation pipeline:

1. **Data Ingestion** - Automated scraping from NPI Registry, State Medical Board databases, and Google Places API
2. **Cross-Validation** - Systematic verification of provider credentials across all collected sources
3. **Data Enrichment** - Intelligent gap-filling for missing information and data normalization
4. **Trust Scoring** - Weighted calculation generating A-F grades with actionable recommendations

**Key Differentiators**

- Processing speed: 30-45 seconds per provider (vs 2-3 days manual validation)
- Multi-source verification: Simultaneous validation across 3+ authoritative databases
- Real-time monitoring: WebSocket-based progress tracking and notifications
- Human-in-the-loop: Feedback integration for continuous model improvement
- Vector similarity search: Semantic matching for duplicate detection using Milvus

---

## Methodology

### Multi-Agent Architecture

The system employs specialized AI agents, each responsible for a distinct validation stage:

**Ingestion Agent**
- Scrapes National Provider Identifier (NPI) Registry for federal provider data
- Queries State Medical Board APIs for license verification
- Retrieves contact information from Google Places API
- Processes unstructured documents using Mistral AI OCR (Pixtral-12B model)

**Validation Agent**
- Cross-references provider names across all data sources
- Verifies license numbers and expiration dates
- Validates contact information (phone, email, address)
- Flags discrepancies and conflicts with severity ratings

**Enrichment Agent**
- Fills missing fields using most reliable source data
- Calculates data completeness percentage
- Normalizes inconsistent data formats (addresses, phone numbers)
- Generates vector embeddings for semantic search

**Scoring Agent**
- Applies weighted trust score algorithm
- Assigns letter grades (A-F) based on validation results
- Generates specific recommendations for data improvement
- Updates PostgreSQL database with validation results

### Orchestration Strategy

LangGraph manages the sequential execution of agents through a state machine:

```python
workflow = StateGraph(ValidationState)
workflow.add_node("ingestion", ingestion_agent)
workflow.add_node("validation", validation_agent)
workflow.add_node("enrichment", enrichment_agent)
workflow.add_node("scoring", scoring_agent)

workflow.add_edge("ingestion", "validation")
workflow.add_edge("validation", "enrichment")
workflow.add_edge("enrichment", "scoring")
```

### Trust Score Calculation

```
Trust Score = (NPI_Match_Score × 0.4) + (License_Validity_Score × 0.4) + (Data_Completeness × 0.2)

Where:
- NPI_Match_Score: 100 if verified in NPI Registry, 0 otherwise
- License_Validity_Score: 100 if active, 50 if inactive, 0 if invalid/expired
- Data_Completeness: (Number_of_Filled_Fields / Total_Required_Fields) × 100

Grade Assignment:
A: 90-100 (Excellent - all sources verified)
B: 80-89  (Good - minor discrepancies)
C: 70-79  (Acceptable - some missing data)
D: 60-69  (Poor - significant gaps)
F: <60    (Failed - major conflicts or missing critical data)
```

---

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Frontend                           │
│                  (TypeScript + Vite + Tailwind)                 │
│                                                                 │
│  • Provider Upload Interface    • Trust Score Dashboard        │
│  • Real-time Progress Monitor   • Validation Results Viewer    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ WebSocket (Real-time Updates)
                         │ REST API (CRUD Operations)
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Java Spring Boot Backend                      │
│                                                                 │
│  • REST Controllers          • WebSocket Server                │
│  • Async Job Orchestration   • JWT Authentication              │
│  • PostgreSQL Integration    • Exception Handling              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTP REST
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Python FastAPI Agent Service                   │
│                                                                 │
│  • LangGraph Orchestrator    • Mistral OCR Integration         │
│  • 4 Specialized Agents      • Milvus Vector Database          │
│  • External API Clients      • Sentence Transformers           │
└─────────────────────────┬───────────────────────┬───────────────┘
                          │                       │
                          ▼                       ▼
                ┌──────────────────┐    ┌──────────────────┐
                │   PostgreSQL 15  │    │   Milvus 2.3.6   │
                │                  │    │                  │
                │ • Provider Data  │    │ • Vector Embed.  │
                │ • Validation Jobs│    │ • Semantic Search│
                │ • Trust Scores   │    │ • Similarity     │
                └──────────────────┘    └──────────────────┘
```

### Data Flow

1. User uploads CSV or PDF containing provider data via React frontend
2. Java backend parses the file and stores records in PostgreSQL
3. Backend creates validation job and triggers Python agent service via HTTP
4. Python agents execute in sequence (LangGraph orchestration):
   - Ingestion Agent scrapes external APIs
   - Validation Agent cross-checks data
   - Enrichment Agent fills gaps
   - Scoring Agent calculates trust score
5. Python service stores vector embeddings in Milvus for semantic search
6. Python service sends progress updates to Java backend via HTTP callbacks
7. Java backend broadcasts real-time updates to frontend via WebSocket
8. Frontend displays validation results and trust scores

---

## Technology Stack

### Backend (Java Spring Boot)

| Component | Version | Purpose |
|-----------|---------|---------|
| Java | 17 | Core programming language with modern features |
| Spring Boot | 3.2 | Application framework and dependency injection |
| Spring Data JPA | 3.2 | Database ORM and repository pattern |
| Spring Security | 3.2 | JWT-based authentication and authorization |
| Spring WebSocket | 3.2 | Real-time bidirectional communication |
| PostgreSQL Driver | 42.7.1 | Database connectivity |
| Lombok | 1.18.30 | Boilerplate code reduction |
| OpenCSV | 5.9 | CSV file parsing and validation |
| RestTemplate | 3.2 | HTTP client for Python service communication |

### AI Agent Layer (Python)


| Component | Version | Purpose |
|-----------|---------|---------|
| Python | 3.11+ | Core programming language for AI agents |
| FastAPI | 0.109+ | High-performance async web framework |
| LangGraph | 0.0.26+ | Multi-agent workflow orchestration |
| LangChain | 0.1.20+ | LLM framework and chain composition |
| Mistral AI | 0.1.8 | OCR processing using Pixtral-12B model |
| Milvus | 2.3.6 | Vector database for semantic similarity search |
| Sentence Transformers | 2.3.1 | Text embedding generation (all-MiniLM-L6-v2) |
| PyTorch | 2.9+ | Machine learning framework |
| BeautifulSoup4 | 4.12.3 | HTML/XML parsing for web scraping |
| Requests | 2.31+ | HTTP library for external API calls |
| Pydantic | 2.5+ | Data validation and settings management |

### Frontend (React + TypeScript)

| Component | Version | Purpose |
|-----------|---------|---------|
| React | 18.3.1 | UI component library |
| TypeScript | 5.8.3 | Type-safe JavaScript development |
| Vite | 5.4.19 | Fast build tool and development server |
| Tailwind CSS | 3.4.17 | Utility-first CSS framework |
| Radix UI | Latest | Accessible component primitives |
| React Hook Form | 7.5+ | Form state management and validation |
| Zustand | 4.4+ | Lightweight state management |

### Infrastructure

| Component | Version | Purpose |
|-----------|---------|---------|
| Docker | Latest | Containerization platform |
| Docker Compose | Latest | Multi-container orchestration |
| PostgreSQL | 15 | Primary relational database |
| Milvus | 2.3.6 | Vector database for embeddings |
| Etcd | Latest | Distributed key-value store (Milvus dependency) |
| MinIO | Latest | Object storage (Milvus dependency) |

---

## Installation

### Prerequisites

- Java Development Kit (JDK) 17 or higher
- Python 3.11 or higher
- Node.js 18 or higher
- Docker and Docker Compose
- Maven 3.8+ (or use included Maven wrapper)
- Git

### Step 1: Clone Repository

```bash
git clone https://github.com/CroWzblooD/LampStack.git
cd LampStack
```

### Step 2: Start Infrastructure Services

```bash
docker-compose up -d
```

This starts PostgreSQL, Milvus, Etcd, and MinIO containers. Verify services:

```bash
docker-compose ps
```

Expected services:
- `postgres` on port 5432
- `milvus-standalone` on port 19530
- `etcd` on port 2379
- `minio` on ports 9000/9001

### Step 3: Backend Setup

```bash
cd server

# Build the project
./mvnw clean install

# Run the application
./mvnw spring-boot:run
```

The backend will start on `http://localhost:8080`

### Step 4: Agent Service Setup

```bash
cd agent-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the service
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

The agent service will start on `http://localhost:8001`

### Step 5: Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start on `http://localhost:5173`

---

## Configuration

### Backend Configuration

Create `server/.env`:

```env
# Database
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/healthcare_validation
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=yourpassword

# Security
JWT_SECRET=your-256-bit-secret-key-here
JWT_EXPIRATION=86400000

# Agent Service
PYTHON_AGENT_SERVICE_URL=http://localhost:8001

# Server
SERVER_PORT=8080
```

Alternatively, edit `server/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/healthcare_validation
    username: postgres
    password: yourpassword
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false

app:
  jwt:
    secret: your-secret-key
    expiration: 86400000
  python:
    agent-service:
      url: http://localhost:8001
```

### Agent Service Configuration

Create `agent-service/.env`:

```env
# Java Backend
JAVA_SERVICE_URL=http://localhost:8080

# AI Services
MISTRAL_API_KEY=your-mistral-api-key-here

# Vector Database
MILVUS_HOST=localhost
MILVUS_PORT=19530

# PostgreSQL
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/healthcare_validation

# External APIs
NPI_REGISTRY_API_URL=https://npiregistry.cms.hhs.gov/api
GOOGLE_PLACES_API_KEY=your-google-places-api-key-here
```

### Frontend Configuration

Create `client/.env.local`:

```env
VITE_API_URL=http://localhost:8080/api
VITE_WS_URL=ws://localhost:8080/ws
```
