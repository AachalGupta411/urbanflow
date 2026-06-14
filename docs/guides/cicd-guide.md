# CI/CD Guide – UrbanFlow

## Pipeline Overview

The Jenkins pipeline (`Jenkinsfile`) implements 9 stages:

```
Checkout → Dependencies → Tests → Static Analysis → Docker Build
    → Trivy Scan → Push to ECR → Deploy K8s → Smoke Tests
```

## Stage Details

### Stage 1: Git Checkout
Clones the repository and captures the short Git commit SHA for image tagging.

### Stage 2: Install Dependencies
Parallel installation of npm packages for all 5 microservices, shared library, and frontend.

### Stage 3: Run Tests
- **Unit tests**: Jest for each microservice with coverage
- **Frontend build**: Validates TypeScript compilation
- JUnit results published (if configured)

### Stage 4: Static Analysis
ESLint on service source code. Warnings logged; does not fail pipeline by default.

### Stage 5: Build Docker Images
Multi-stage builds for all services + frontend:

```bash
docker build -f services/ticketing-service/Dockerfile -t urbanflow/ticketing-service:latest services/
```

### Stage 6: Security Scan (Trivy)
Scans all images for CRITICAL and HIGH vulnerabilities. Pipeline fails on unfixed CRITICAL findings.

```bash
trivy image --severity CRITICAL,HIGH --exit-code 1 urbanflow/ticketing-service:latest
```

### Stage 7: Push Images (main branch only)
Tags images with `{BUILD_NUMBER}-{GIT_COMMIT}` and pushes to AWS ECR.

### Stage 8: Deploy to Kubernetes (main branch only)
Applies all manifests and waits for rollout status on core deployments.

### Stage 9: Smoke Tests
Runs `scripts/smoke-test.sh` — health checks + register user + create ticket.

## Branch Strategy

| Branch | Build | Test | Scan | Push | Deploy |
|--------|-------|------|------|------|--------|
| feature/* | ✅ | ✅ | ✅ | ❌ | ❌ |
| develop | ✅ | ✅ | ✅ | ❌ | ❌ |
| main | ✅ | ✅ | ✅ | ✅ | ✅ |

## Manual Pipeline Trigger

```bash
# From Jenkins UI: Build Now
# Or via CLI:
java -jar jenkins-cli.jar -s http://jenkins:8080 build urbanflow-pipeline
```

## Setup

See [jenkins/setup-guide.md](../../jenkins/setup-guide.md) and [jenkins/credentials-guide.md](../../jenkins/credentials-guide.md).

## Troubleshooting

| Failure | Resolution |
|---------|------------|
| Tests fail | Check service logs; run `npm test` locally |
| Trivy CRITICAL | Update base image or patch dependencies |
| ECR push denied | Verify IAM credentials and ECR repository exists |
| K8s deploy timeout | Check pod events: `kubectl describe pod -n urbanflow` |
| Smoke test fails | Ensure all services are healthy before smoke run |
