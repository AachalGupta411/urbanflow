# UrbanFlow – Complete Repository Structure

Every file and directory in this repository, with its purpose.

```
UrbanFlow/
│
├── README.md                          # Project overview, quick start, command reference
├── .gitignore                         # Node, Docker, Terraform, IDE exclusions
├── docker-compose.yml                 # Full local stack (services + infra + observability)
├── docker-compose.dev.yml             # Dev overrides (hot reload, debug ports)
├── Jenkinsfile                        # Declarative Jenkins pipeline (9 stages)
│
├── frontend/                          # React + Vite SPA
│   ├── Dockerfile                     # Multi-stage: build → nginx serve
│   ├── .dockerignore
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   ├── nginx.conf                     # SPA routing + gzip
│   └── src/
│       ├── main.tsx                   # App entry point
│       ├── App.tsx                    # Router + layout
│       ├── components/                # Reusable UI (Navbar, TicketCard, MapView)
│       ├── pages/                     # Login, Register, Dashboard, Tickets, Tracking
│       ├── services/                  # Axios API clients per microservice
│       ├── hooks/                     # useAuth, useTickets, useGPS
│       ├── utils/                     # Token storage, formatters
│       └── styles/                    # Global CSS / theme
│
├── services/
│   ├── shared/                        # Cross-service utilities (copied/symlinked per service)
│   │   ├── middleware/
│   │   │   ├── auth.js                # JWT verification middleware
│   │   │   ├── rateLimiter.js         # Redis-backed rate limiting
│   │   │   ├── validator.js           # express-validator wrappers
│   │   │   └── metrics.js             # Prometheus middleware
│   │   ├── utils/
│   │   │   ├── logger.js              # Winston JSON structured logger
│   │   │   ├── kafka.js               # Kafka producer/consumer factory
│   │   │   ├── redis.js               # Redis client singleton
│   │   │   └── db.js                  # MySQL connection pool
│   │   └── config/
│   │       └── index.js               # Environment-based config loader
│   │
│   ├── ticketing-service/
│   │   ├── Dockerfile                 # Multi-stage Node.js build
│   │   ├── .dockerignore
│   │   ├── package.json
│   │   ├── jest.config.js
│   │   ├── src/
│   │   │   ├── index.js               # Express app bootstrap
│   │   │   ├── routes/tickets.js      # CRUD + validate + cancel
│   │   │   ├── controllers/ticketController.js
│   │   │   ├── services/ticketService.js
│   │   │   └── models/ticketModel.js
│   │   └── tests/
│   │       ├── unit/ticketService.test.js
│   │       └── integration/tickets.test.js
│   │
│   ├── passenger-service/
│   │   ├── Dockerfile
│   │   ├── .dockerignore
│   │   ├── package.json
│   │   ├── jest.config.js
│   │   ├── src/
│   │   │   ├── index.js
│   │   │   ├── routes/passengers.js   # register, login, profile
│   │   │   │   ├── auth.js            # JWT issue/refresh
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   └── models/
│   │   └── tests/
│   │
│   ├── gps-service/
│   │   ├── Dockerfile
│   │   ├── .dockerignore
│   │   ├── package.json
│   │   ├── jest.config.js
│   │   ├── src/
│   │   │   ├── index.js
│   │   │   ├── routes/gps.js          # coordinates, tracking, routes
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   └── models/
│   │   └── tests/
│   │
│   ├── notification-service/
│   │   ├── Dockerfile
│   │   ├── .dockerignore
│   │   ├── package.json
│   │   ├── jest.config.js
│   │   ├── src/
│   │   │   ├── index.js
│   │   │   ├── routes/notifications.js
│   │   │   ├── consumers/             # Kafka consumer handlers
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   └── models/
│   │   └── tests/
│   │
│   └── analytics-service/
│       ├── Dockerfile
│       ├── .dockerignore
│       ├── package.json
│       ├── jest.config.js
│       ├── src/
│       │   ├── index.js
│       │   ├── routes/analytics.js    # stats endpoints
│       │   ├── consumers/             # Kafka aggregation
│       │   ├── controllers/
│       │   ├── services/
│       │   └── models/
│       └── tests/
│
├── database/
│   ├── init/
│   │   ├── 01-schemas.sql             # CREATE DATABASE per service
│   │   ├── 02-ticketing.sql           # tickets, bookings tables
│   │   ├── 03-passenger.sql           # passengers, profiles
│   │   ├── 04-gps.sql                 # vehicles, coordinates, routes
│   │   ├── 05-notification.sql        # notifications, templates
│   │   └── 06-analytics.sql           # aggregated stats tables
│   └── migrations/                    # Future schema migrations
│
├── terraform/                         # Infrastructure as Code
│   ├── main.tf                        # Root module composition
│   ├── variables.tf                   # Input variables
│   ├── outputs.tf                     # VPC ID, EKS endpoint, etc.
│   ├── versions.tf                    # Provider pins
│   ├── backend.tf                     # S3 remote state
│   ├── modules/
│   │   ├── vpc/
│   │   │   ├── main.tf                # VPC, subnets, NAT, IGW
│   │   │   ├── variables.tf
│   │   │   └── outputs.tf
│   │   ├── security-groups/
│   │   │   ├── main.tf                # ALB, EKS, Jenkins, DB SGs
│   │   │   ├── variables.tf
│   │   │   └── outputs.tf
│   │   ├── iam/
│   │   │   ├── main.tf                # EKS, node, Jenkins, backup roles
│   │   │   ├── variables.tf
│   │   │   └── outputs.tf
│   │   ├── eks/
│   │   │   ├── main.tf                # Cluster + node groups
│   │   │   ├── variables.tf
│   │   │   └── outputs.tf
│   │   ├── ec2-jenkins/
│   │   │   ├── main.tf                # Jenkins EC2 + EIP
│   │   │   ├── variables.tf
│   │   │   ├── outputs.tf
│   │   │   └── user-data.sh           # Jenkins bootstrap script
│   │   └── monitoring/
│   │       ├── main.tf                # Monitoring EC2 / Prometheus host
│   │       ├── variables.tf
│   │       └── outputs.tf
│   └── environments/
│       ├── dev/
│       │   ├── main.tf                # Dev tfvars wiring
│       │   ├── terraform.tfvars
│       │   └── backend.tf
│       ├── staging/
│       │   ├── main.tf
│       │   ├── terraform.tfvars
│       │   └── backend.tf
│       └── prod/
│           ├── main.tf
│           ├── terraform.tfvars
│           └── backend.tf
│
├── kubernetes/
│   ├── namespace/
│   │   └── urbanflow.yaml             # urbanflow + monitoring namespaces
│   ├── deployments/
│   │   ├── ticketing-deployment.yaml
│   │   ├── passenger-deployment.yaml
│   │   ├── gps-deployment.yaml
│   │   ├── notification-deployment.yaml
│   │   ├── analytics-deployment.yaml
│   │   ├── frontend-deployment.yaml
│   │   ├── mysql-statefulset.yaml
│   │   ├── redis-deployment.yaml
│   │   └── kafka-statefulset.yaml
│   ├── services/
│   │   ├── ticketing-service.yaml
│   │   ├── passenger-service.yaml
│   │   ├── gps-service.yaml
│   │   ├── notification-service.yaml
│   │   ├── analytics-service.yaml
│   │   ├── frontend-service.yaml
│   │   ├── mysql-service.yaml
│   │   ├── redis-service.yaml
│   │   └── kafka-service.yaml
│   ├── ingress/
│   │   └── urbanflow-ingress.yaml     # NGINX ingress rules
│   ├── configmaps/
│   │   ├── app-config.yaml            # Non-sensitive env vars
│   │   ├── mysql-config.yaml
│   │   └── prometheus-config.yaml
│   ├── secrets/
│   │   ├── app-secrets.yaml.example   # Template (never commit real secrets)
│   │   └── mysql-secrets.yaml.example
│   ├── hpa/
│   │   ├── ticketing-hpa.yaml
│   │   ├── passenger-hpa.yaml
│   │   ├── gps-hpa.yaml
│   │   ├── notification-hpa.yaml
│   │   └── analytics-hpa.yaml
│   ├── rbac/
│   │   ├── service-accounts.yaml
│   │   ├── roles.yaml
│   │   └── role-bindings.yaml
│   ├── network-policies/
│   │   ├── default-deny.yaml
│   │   ├── allow-ingress.yaml
│   │   └── allow-internal.yaml
│   └── backup/
│       └── mysql-backup-cronjob.yaml  # Daily mysqldump → S3
│
├── monitoring/
│   ├── prometheus/
│   │   ├── prometheus.yml             # Scrape configs for all services
│   │   └── alert-rules.yml            # CPU, memory, error rate alerts
│   ├── grafana/
│   │   ├── provisioning/
│   │   │   ├── datasources.yaml
│   │   │   └── dashboards.yaml
│   │   └── dashboards/
│   │       ├── urbanflow-overview.json
│   │       ├── api-performance.json
│   │       └── business-metrics.json
│   └── alertmanager/
│       └── alertmanager.yml
│
├── logging/
│   ├── elasticsearch/
│   │   └── elasticsearch.yml
│   ├── logstash/
│   │   ├── logstash.conf              # Pipeline: beats → ES
│   │   └── patterns/
│   ├── kibana/
│   │   └── kibana.yml
│   └── filebeat/
│       └── filebeat.yml               # Container log shipping
│
├── tests/
│   ├── unit/                          # Cross-service unit tests (if any)
│   ├── integration/
│   │   └── docker-compose.test.yml    # Integration test environment
│   └── load/
│       └── k6/
│           ├── ticket-load.js         # Ticket creation load test
│           ├── gps-load.js            # GPS ingestion load test
│           └── mixed-workload.js      # Combined scenario
│
├── scripts/
│   ├── build-all.sh                   # Build all Docker images
│   ├── deploy-k8s.sh                  # Apply all K8s manifests
│   ├── smoke-test.sh                  # Post-deploy health checks
│   ├── backup-mysql.sh                # Manual backup trigger
│   ├── restore-mysql.sh               # Restore from S3 dump
│   └── setup-local.sh                 # One-command local dev setup
│
├── jenkins/
│   ├── setup-guide.md                 # Jenkins EC2 installation steps
│   └── credentials-guide.md           # AWS, ECR, K8s credential config
│
└── docs/
    ├── PROJECT_STRUCTURE.md           # This file
    ├── architecture/
    │   └── ARCHITECTURE.md            # Architecture design + Mermaid diagrams
    ├── guides/
    │   ├── deployment-guide.md        # Local + K8s + AWS deployment
    │   ├── cicd-guide.md              # Jenkins pipeline usage
    │   ├── monitoring-guide.md        # Prometheus/Grafana setup
    │   ├── disaster-recovery-guide.md # Backup/restore procedures
    │   ├── security-guide.md          # Security controls reference
    │   └── testing-guide.md           # Jest, Supertest, k6 instructions
    └── superpowers/
        └── specs/
            └── 2026-06-14-urbanflow-design.md  # Formal design spec
```

---

## Directory Purpose Summary

| Directory | Purpose |
|-----------|---------|
| `frontend/` | React SPA – commuter and operator UI |
| `services/*` | Node.js microservices, one folder per bounded context |
| `services/shared/` | DRY utilities: auth, logging, metrics, DB, Kafka, Redis |
| `database/init/` | MySQL schema bootstrap for Docker Compose and K8s init containers |
| `terraform/` | AWS VPC, EKS, IAM, Jenkins EC2, monitoring – full IaC |
| `kubernetes/` | Production K8s manifests with HA, HPA, RBAC, NetworkPolicies |
| `monitoring/` | Prometheus scrape config, Grafana dashboard JSON exports |
| `logging/` | ELK stack configuration for centralized logging |
| `tests/load/k6/` | Load testing scripts for university performance demo |
| `scripts/` | Operational scripts: build, deploy, backup, restore, smoke tests |
| `jenkins/` | CI/CD setup and credentials documentation |
| `docs/` | Architecture, guides, and design specifications |

---

## Port Allocation (Local / Docker Compose)

| Component | Host Port | Internal Port |
|-----------|-----------|---------------|
| Frontend | 8080 | 80 |
| Ticketing Service | 3001 | 3001 |
| Passenger Service | 3002 | 3002 |
| GPS Service | 3003 | 3003 |
| Notification Service | 3004 | 3004 |
| Analytics Service | 3005 | 3005 |
| MySQL | 3306 | 3306 |
| Redis | 6379 | 6379 |
| Kafka | 9092 | 9092 |
| Prometheus | 9090 | 9090 |
| Grafana | 3000 | 3000 |
| Kibana | 5601 | 5601 |
| Elasticsearch | 9200 | 9200 |

---

## Environment Variables (Global)

| Variable | Description | Source |
|----------|-------------|--------|
| `NODE_ENV` | development / production | ConfigMap |
| `JWT_SECRET` | JWT signing key | K8s Secret |
| `MYSQL_HOST` | Database hostname | ConfigMap |
| `MYSQL_USER` / `MYSQL_PASSWORD` | DB credentials | K8s Secret |
| `REDIS_URL` | Redis connection string | ConfigMap |
| `KAFKA_BROKERS` | Kafka bootstrap servers | ConfigMap |
| `LOG_LEVEL` | Winston log level | ConfigMap |
| `AWS_S3_BACKUP_BUCKET` | Backup destination | ConfigMap + Secret |
