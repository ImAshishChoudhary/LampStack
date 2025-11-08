# Provider Data Validation System - Backend

Spring Boot REST API for autonomous healthcare provider data validation.

## Tech Stack

- Java 17
- Spring Boot 3.2
- PostgreSQL
- Spring Data JPA
- Spring Security (JWT)
- Spring WebSocket
- Lombok

## Getting Started

### Prerequisites

- Java 17+
- Maven 3.8+
- PostgreSQL 14+

### Database Setup

```sql
CREATE DATABASE provider_validation;
```

### Run Application

```bash
mvn spring-boot:run
```

Server runs on http://localhost:8080

## API Endpoints

### Providers
- `POST /api/providers/upload` - Upload CSV
- `GET /api/providers` - List all providers
- `GET /api/providers/{id}` - Get provider by ID

### Validation
- `POST /api/validation/trigger` - Start validation
- `GET /api/validation/jobs/{jobId}` - Get job status

### WebSocket
- `ws://localhost:8080/ws/validation` - Real-time updates
