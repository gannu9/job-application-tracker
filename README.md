# Job Application Tracker

Full-stack skeleton for tracking job applications. The backend and frontend are separate. Authentication and CRUD are not implemented yet.

## Requirements

- Java 21
- Node.js with npm
- Docker, for MySQL 8

This machine also has Java 23, and that is the default `java` on the path. Point Maven at Java 21 before building the backend:

```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
```

## MySQL

From the repository root:

```bash
docker compose up -d
```

That starts MySQL 8 with database `jobtracker`, user `jobtracker`, and password `jobtracker` on port 3306.

## Backend

```bash
cd backend
./mvnw spring-boot:run
```

The API listens on http://localhost:8080. It needs MySQL to be running. `spring.jpa.hibernate.ddl-auto=none`, so Hibernate does not create tables. There are no entities yet.

Spring Security is on the classpath. `SecurityConfig` permits every request and disables CSRF until JWT authentication is added.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

The app is served at http://localhost:5173 and shows the Job Application Tracker heading.
