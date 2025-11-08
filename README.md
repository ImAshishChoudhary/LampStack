# EY Techathon #6 - Provider Data Validation System

Complete autonomous healthcare provider data validation solution with multi-agent architecture.

## Architecture

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Java 17 + Spring Boot 3.2
- **Agent Service**: Python 3.11 + FastAPI + LangGraph
- **Databases**: PostgreSQL 15 + Milvus 2.3
- **AI/ML**: Mistral AI (OCR) + Sentence Transformers

## Prerequisites

- Node.js 18+ and npm
- Java 17+
- Maven 3.8+
- Python 3.11+
- Docker and Docker Compose

## Quick Start

### 1. Start Databases (Docker)

```powershell
# Start PostgreSQL and Milvus
docker-compose up -d

# Verify services are running
docker-compose ps
```

### 2. Setup Backend (Java Spring Boot)

```powershell
cd server

# Install dependencies and build
mvn clean install

# Run Spring Boot application
mvn spring-boot:run
```

Backend will run on `http://localhost:8080`

### 3. Setup Agent Service (Python)

```powershell
cd agent-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Create .env file
Copy-Item .env.example .env

# Edit .env and add your Mistral API key
# MISTRAL_API_KEY=your_key_here

# Run FastAPI service
python main.py
```

Agent service will run on `http://localhost:5000`

### 4. Setup Frontend (React)

```powershell
cd client

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will run on `http://localhost:5173`

## Project Structure

```
Ey6/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Page components
│   │   └── main.tsx        # Entry point
│   └── package.json
│
├── server/                 # Java Spring Boot backend
│   ├── src/main/java/com/healthcare/validation/
│   │   ├── domain/         # JPA entities
│   │   ├── repository/     # Spring Data repositories
│   │   ├── service/        # Business logic
│   │   ├── controller/     # REST controllers
│   │   └── config/         # Configuration classes
│   ├── src/main/resources/
│   │   └── application.yml
│   └── pom.xml
│
├── agent-service/          # Python agent service
│   ├── app/
│   │   ├── services/
│   │   │   ├── agents/     # Validation agents
│   │   │   ├── orchestrator.py
│   │   │   ├── langgraph_orchestrator.py
│   │   │   ├── vector_store.py
│   │   │   └── mistral_ocr.py
│   │   ├── api/            # FastAPI routes
│   │   └── core/           # Configuration
│   ├── main.py
│   └── requirements.txt
│
└── docker-compose.yml      # PostgreSQL + Milvus
```

## API Endpoints

### Backend (Spring Boot) - Port 8080

- `POST /api/providers/upload` - Upload CSV of providers
- `GET /api/providers` - Get all providers
- `POST /api/validation/trigger` - Trigger validation job
- `GET /api/validation/jobs/{jobId}` - Get job status
- `GET /api/trust/scores` - Get trust scores
- `POST /api/trust/feedback` - Submit human feedback

### Agent Service (Python) - Port 5000

- `POST /api/agents/validate` - Trigger agent validation
- `GET /health` - Health check

## Environment Variables

### Backend (.env or application.yml)
```yaml
spring.datasource.url=jdbc:postgresql://localhost:5432/provider_validation
spring.datasource.username=postgres
spring.datasource.password=password
app.python.agent-service.url=http://localhost:5000
app.jwt.secret=your_jwt_secret_key
```

### Agent Service (.env)
```
JAVA_SERVICE_URL=http://localhost:8080
MISTRAL_API_KEY=your_mistral_api_key
DATABASE_URL=postgresql://postgres:password@localhost:5432/provider_validation
MILVUS_HOST=localhost
MILVUS_PORT=19530
LOG_LEVEL=INFO
```

## Development Workflow

1. User uploads CSV via frontend
2. Java backend parses CSV, stores providers in PostgreSQL
3. Java triggers validation job
4. Java calls Python agent service via HTTP
5. Python agents execute via LangGraph:
   - Ingestion Agent (scrapes NPI, State Boards, Google)
   - Validation Agent (cross-references sources)
   - Enrichment Agent (fills missing fields)
   - Scoring Agent (calculates trust scores)
6. Python stores embeddings in Milvus
7. Python sends progress updates to Java via HTTP callbacks
8. Java broadcasts updates to frontend via WebSocket
9. Frontend displays real-time workflow in IdeationCanvas
10. Human reviews results and provides feedback
11. Trust scores update based on feedback

## Troubleshooting

### PostgreSQL connection error
```powershell
# Check if PostgreSQL is running
docker-compose ps

# Restart PostgreSQL
docker-compose restart postgres
```

### Milvus connection error
```powershell
# Check Milvus logs
docker-compose logs milvus-standalone

# Restart Milvus
docker-compose restart milvus-standalone
```

### Python dependencies error
```powershell
# Upgrade pip
python -m pip install --upgrade pip

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Maven build error
```powershell
# Clean and rebuild
mvn clean install -U
```

## Testing

### Test Backend
```powershell
cd server
mvn test
```

### Test Agent Service
```powershell
cd agent-service
pytest
```

### Test Frontend
```powershell
cd client
npm test
```

## Production Deployment

1. Build frontend: `cd client && npm run build`
2. Build backend: `cd server && mvn package`
3. Package agent service: Create Docker image
4. Deploy to cloud (Azure, AWS, etc.)
5. Configure environment variables
6. Set up PostgreSQL and Milvus in cloud

## License

MIT License - EY Techathon #6
