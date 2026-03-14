---
name: docker-config-generator
description: Automatically analyzes project structure and generates corresponding Dockerfile and docker-compose.yml files.
---

# Containerization Configuration Generation Specification

## Perceive
1. Scan the project root directory to identify core language and framework characteristics (e.g., `package.json`, `requirements.txt`, `go.mod`, `pom.xml`).
2. Read dependency lists and environment variable configuration files (e.g., `.env.example`, `config.yaml`).
3. Detect default listening ports and start commands of the application.
4. Identify external dependency services associated with the project (e.g., PostgreSQL, Redis, MongoDB).

## Reason
1. Select the most optimized official base image according to the development language (e.g., prioritize Alpine or Slim versions to reduce size).
2. Evaluate the necessity of applying multi-stage builds to separate the compilation environment from the execution environment.
3. Plan the layer caching strategy for the Dockerfile, placing low-frequency change dependency installation commands before source code copy commands.
4. Define corresponding `.dockerignore` rules to exclude local development files and sensitive information (e.g., `.git`, `node_modules`, `venv`, `.env`).
5. Construct the services, networks, and volumes structures in `docker-compose.yml` based on associated external services, and configure the dependency startup sequence (`depends_on`).
6. Enforce security best practices (e.g., configure non-root user permissions to execute the application).

## Act
1. Generate standardized `Dockerfile` source code compliant with security specifications.
2. Generate `docker-compose.yml` source code containing configurations for the application and all dependent services.
3. Generate `.dockerignore` file content to prevent packaging invalid files.
4. Output a list of terminal commands for subsequent deployment verification (e.g., `docker compose up -d --build`).