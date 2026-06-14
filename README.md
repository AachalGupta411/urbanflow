# UrbanFlow – Intelligent Public Transportation Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20_LTS-green.svg)](https://nodejs.org/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-1.28+-326CE5.svg)](https://kubernetes.io/)
[![Terraform](https://img.shields.io/badge/Terraform-1.6+-7B42BC.svg)](https://terraform.io/)

Cloud-native transportation management platform for bus, metro, and EV fleet operations. Built to demonstrate enterprise DevOps practices for university evaluation and production readiness.

---

## Features

| Domain | Capabilities |
|--------|-------------|
| **Ticketing** | Create, validate, cancel tickets; view bookings |
| **Passengers** | Registration, JWT login, profile management |
| **GPS Tracking** | Real-time coordinates, vehicle tracking, route updates |
| **Notifications** | Delay alerts, route changes, system announcements |
| **Analytics** | Passenger stats, ticket stats, route utilization |

---

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────────────────────┐
│   React     │────▶│   Ingress    │────▶│  Microservices (Node.js/Express) │
│   + Vite    │     │   (NGINX)    │     │  Ticketing │ Passenger │ GPS    │
└─────────────┘     └──────────────┘     │  Notification │ Analytics       │
                                          └──────────┬──────────────────────┘
                                                     │
                    ┌────────────────────────────────┼────────────────────┐
                    │                                │                    │
              ┌─────▼─────┐   ┌──────────▼──────────┐   ┌───────▼───────┐
              │   MySQL   │   │  Redis + Kafka      │   │ Prometheus /  │
              │           │   │                     │   │ Grafana / ELK │
              └───────────┘   └─────────────────────┘   └───────────────┘
```

Full architecture diagrams: [docs/architecture/ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md)

Complete file tree: [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md)

---

## Repository Structure (Summary)

```
UrbanFlow/
├── frontend/              # React + Vite SPA
├── services/              # 5 microservices + shared libs
├── database/init/         # MySQL schema scripts
├── terraform/             # AWS IaC (VPC, EKS, IAM, Jenkins)
├── kubernetes/            # K8s manifests (HA, HPA, RBAC)
├── monitoring/            # Prometheus + Grafana dashboards
├── logging/               # ELK stack configs
├── tests/load/k6/         # Load testing scripts
├── scripts/               # Build, deploy, backup, restore
├── jenkins/               # CI/CD setup guides
└── docs/                  # Architecture & operational guides
```

---

## Quick Start (Local – Docker Compose)

```bash
git clone https://github.com/your-org/UrbanFlow.git
cd UrbanFlow
chmod +x scripts/*.sh
./scripts/setup-local.sh          # Installs deps, builds & starts full stack

# Or manually:
docker compose up -d --build
./scripts/smoke-test.sh

# Access services
open http://localhost:8080        # Frontend
open http://localhost:3000        # Grafana (admin/admin)
open http://localhost:5601        # Kibana
open http://localhost:9090        # Prometheus
```

**121 unit/integration tests** pass across all 5 microservices.

---

## Development Commands

```bash
# Run tests for all services
npm run test --workspaces

# Build all Docker images
./scripts/build-all.sh

# Run load tests
k6 run tests/load/k6/mixed-workload.js

# Deploy to Kubernetes
./scripts/deploy-k8s.sh

# Manual MySQL backup
./scripts/backup-mysql.sh
```

---

## AWS Deployment

```bash
# Provision infrastructure
cd terraform/environments/dev
terraform init
terraform plan -out=tfplan
terraform apply tfplan

# Configure kubectl
aws eks update-kubeconfig --name urbanflow-dev --region us-east-1

# Deploy application
kubectl apply -f kubernetes/namespace/
kubectl apply -f kubernetes/configmaps/
kubectl apply -f kubernetes/secrets/    # populate from .example first
kubectl apply -R -f kubernetes/
```

See [docs/guides/deployment-guide.md](docs/guides/deployment-guide.md) for full instructions.

---

## CI/CD Pipeline

Jenkins pipeline stages:

1. Git Checkout → 2. Install Dependencies → 3. Run Tests → 4. Static Analysis → 5. Build Docker Images → 6. Trivy Security Scan → 7. Push Images → 8. Deploy to Kubernetes → 9. Smoke Tests

See [jenkins/setup-guide.md](jenkins/setup-guide.md) and [docs/guides/cicd-guide.md](docs/guides/cicd-guide.md).

---

## Documentation

| Guide | Description |
|-------|-------------|
| [Architecture](docs/architecture/ARCHITECTURE.md) | System design + Mermaid diagrams |
| [Project Structure](docs/PROJECT_STRUCTURE.md) | Complete file tree |
| [Deployment Guide](docs/guides/deployment-guide.md) | Local, K8s, AWS deployment |
| [CI/CD Guide](docs/guides/cicd-guide.md) | Jenkins pipeline |
| [Monitoring Guide](docs/guides/monitoring-guide.md) | Prometheus & Grafana |
| [Disaster Recovery](docs/guides/disaster-recovery-guide.md) | Backup & restore |
| [Security Guide](docs/guides/security-guide.md) | Security controls |
| [Testing Guide](docs/guides/testing-guide.md) | Jest, Supertest, k6 |

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, TypeScript |
| Backend | Node.js 20, Express 4 |
| Database | MySQL 8.0 |
| Cache | Redis 7 |
| Messaging | Apache Kafka 3.x |
| Containers | Docker (multi-stage) |
| Orchestration | Kubernetes / AWS EKS |
| IaC | Terraform |
| CI/CD | Jenkins |
| Monitoring | Prometheus, Grafana |
| Logging | ELK + Filebeat |
| Security | Trivy, RBAC, NetworkPolicies, JWT |

---

## License

MIT License – see [LICENSE](LICENSE) for details.
