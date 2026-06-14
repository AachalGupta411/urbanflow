# UrbanFlow – Architecture Design

> **Intelligent Public Transportation Platform**  
> Cloud-native microservices architecture for bus, metro, and EV fleet management at scale.

---

## 1. Executive Summary

UrbanFlow is a production-style transportation management platform designed to support millions of commuters. It demonstrates enterprise DevOps practices: Infrastructure as Code (Terraform), containerization (Docker), orchestration (Kubernetes), CI/CD (Jenkins), observability (Prometheus/Grafana, ELK), and security hardening (RBAC, Network Policies, Trivy).

The platform is **dual-mode**:
- **Local development**: Docker Compose runs all services, databases, and observability stacks on a single machine.
- **Production deployment**: Terraform provisions AWS infrastructure; Kubernetes runs microservices on EKS with HA, autoscaling, and disaster recovery.

---

## 2. High-Level Architecture

```mermaid
flowchart TB
    subgraph Users["Users & Operators"]
        Commuter["Commuters / Mobile Web"]
        Admin["Operations Dashboard"]
    end

    subgraph Edge["Edge Layer"]
        ALB["AWS Application Load Balancer"]
        Ingress["NGINX Ingress Controller"]
    end

    subgraph Frontend["Presentation Tier"]
        React["React + Vite SPA"]
    end

    subgraph Gateway["API Layer"]
        RateLimit["Rate Limiter / JWT Gateway"]
    end

    subgraph Microservices["Microservices Tier (Node.js + Express)"]
        Ticketing["Ticketing Service<br/>:3001"]
        Passenger["Passenger Service<br/>:3002"]
        GPS["GPS Tracking Service<br/>:3003"]
        Notification["Notification Service<br/>:3004"]
        Analytics["Analytics Service<br/>:3005"]
    end

    subgraph Messaging["Event Streaming"]
        Kafka["Apache Kafka<br/>Topics: gps-events,<br/>ticket-events, notifications"]
    end

    subgraph Cache["Caching"]
        Redis["Redis<br/>Sessions, rate limits,<br/>route cache"]
    end

    subgraph Data["Persistence"]
        MySQL["MySQL 8<br/>Primary + Read Replica"]
    end

    subgraph Observability["Observability"]
        Prometheus["Prometheus"]
        Grafana["Grafana Dashboards"]
        ELK["Elasticsearch / Logstash / Kibana"]
        Filebeat["Filebeat"]
    end

    subgraph CICD["CI/CD & IaC"]
        Jenkins["Jenkins EC2"]
        Terraform["Terraform<br/>VPC, EKS, IAM, SG"]
    end

    subgraph DR["Disaster Recovery"]
        S3["S3 Backup Bucket"]
        CronJob["MySQL Backup CronJob"]
    end

    Commuter --> ALB
    Admin --> ALB
    ALB --> Ingress
    Ingress --> React
    React --> RateLimit
    RateLimit --> Ticketing
    RateLimit --> Passenger
    RateLimit --> GPS
    RateLimit --> Notification
    RateLimit --> Analytics

    Ticketing --> MySQL
    Passenger --> MySQL
    GPS --> MySQL
    Analytics --> MySQL

    Ticketing --> Redis
    Passenger --> Redis
    GPS --> Redis

    GPS -->|publish| Kafka
    Ticketing -->|publish| Kafka
    Kafka -->|consume| Notification
    Kafka -->|consume| Analytics

    Microservices --> Prometheus
    Prometheus --> Grafana
    Microservices --> Filebeat
    Filebeat --> ELK

    Jenkins -->|build & deploy| Microservices
    Terraform -->|provision| Edge
    CronJob --> S3
    MySQL --> CronJob
```

---

## 3. AWS Infrastructure Architecture

```mermaid
flowchart TB
    subgraph AWS["AWS Region (us-east-1)"]
        subgraph VPC["UrbanFlow VPC 10.0.0.0/16"]
            subgraph Public["Public Subnets (AZ-a, AZ-b, AZ-c)"]
                NAT["NAT Gateways"]
                ALB2["ALB"]
                Bastion["Bastion / Monitoring EC2"]
            end

            subgraph Private["Private Subnets (AZ-a, AZ-b, AZ-c)"]
                EKS["EKS Cluster<br/>Worker Nodes"]
                JenkinsEC2["Jenkins EC2"]
            end

            subgraph DataSubnet["Database Subnets"]
                RDS["RDS MySQL<br/>(optional prod path)"]
            end
        end

        subgraph IAM["IAM"]
            EKSRole["EKS Cluster Role"]
            NodeRole["Node Group Role"]
            JenkinsRole["Jenkins Deploy Role"]
            BackupRole["S3 Backup Role"]
        end

        subgraph Storage["Storage"]
            S3Bucket["s3://urbanflow-backups"]
            ECR["ECR Repositories"]
        end
    end

    Internet["Internet"] --> ALB2
    ALB2 --> EKS
    JenkinsEC2 --> ECR
    JenkinsEC2 --> EKS
    EKS --> RDS
    EKS --> S3Bucket
    Terraform2["Terraform State<br/>S3 + DynamoDB Lock"] -.-> VPC
```

---

## 4. Microservices Communication

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant P as Passenger Service
    participant T as Ticketing Service
    participant G as GPS Service
    participant K as Kafka
    participant N as Notification Service
    participant A as Analytics Service
    participant R as Redis
    participant DB as MySQL

    U->>F: Register / Login
    F->>P: POST /api/passengers/register
    P->>DB: INSERT passenger
    P->>R: Cache session
    P-->>F: JWT token

    U->>F: Book ticket
    F->>T: POST /api/tickets (Bearer JWT)
    T->>P: Validate JWT (internal)
    T->>DB: INSERT ticket
    T->>K: Publish ticket.created
    K->>N: Consume event
    K->>A: Consume event
    N-->>U: Delay/route alert (WebSocket/push)

    G->>K: Publish gps.coordinate
    K->>A: Aggregate route utilization
    K->>N: Trigger delay alert if threshold exceeded
```

---

## 5. Service Responsibilities

| Service | Port | Database Schema | Kafka Topics (produce/consume) | Redis Usage |
|---------|------|-----------------|--------------------------------|-------------|
| **Ticketing** | 3001 | `ticketing_db` | produce: `ticket-events` | ticket validation cache |
| **Passenger** | 3002 | `passenger_db` | produce: `passenger-events` | JWT blacklist, sessions |
| **GPS Tracking** | 3003 | `gps_db` | produce: `gps-events` | live vehicle positions |
| **Notification** | 3004 | `notification_db` | consume: `gps-events`, `ticket-events`, `system-events` | notification dedup |
| **Analytics** | 3005 | `analytics_db` | consume: all event topics | aggregated stats cache |

---

## 6. Data Flow Patterns

### 6.1 Synchronous (REST)
- Frontend → Ingress → Microservice for CRUD operations
- Inter-service auth validation via internal HTTP + shared JWT secret (K8s Secret)

### 6.2 Asynchronous (Event-Driven)
- GPS and Ticketing services publish domain events to Kafka
- Notification and Analytics services consume asynchronously
- Decouples peak GPS telemetry from notification delivery

### 6.3 Caching Strategy
- **Redis**: Session tokens, rate-limit counters, hot route data, live GPS snapshots (TTL 30s)
- **Cache-aside** pattern for ticket validation

---

## 7. Kubernetes Architecture

```mermaid
flowchart LR
    subgraph NS["Namespace: urbanflow"]
        subgraph Deployments["Deployments (min 3 replicas each)"]
            D1["ticketing"]
            D2["passenger"]
            D3["gps"]
            D4["notification"]
            D5["analytics"]
            D6["frontend"]
        end

        subgraph HPA["Horizontal Pod Autoscaler"]
            HPA1["CPU/Memory based<br/>min: 3, max: 10"]
        end

        subgraph NetPol["Network Policies"]
            NP1["Deny all default"]
            NP2["Allow ingress from NGINX"]
            NP3["Allow Kafka/MySQL/Redis egress"]
        end

        subgraph RBAC["RBAC"]
            SA["Per-service ServiceAccounts"]
            Role["Least-privilege Roles"]
        end
    end

    Ingress2["Ingress"] --> Deployments
    HPA --> Deployments
    NetPol --> Deployments
    RBAC --> Deployments
```

---

## 8. CI/CD Pipeline Architecture

```mermaid
flowchart LR
    Git["Git Push"] --> Jenkins["Jenkins Pipeline"]
    Jenkins --> S1["1. Checkout"]
    S1 --> S2["2. Install Dependencies"]
    S2 --> S3["3. Unit + Integration Tests"]
    S3 --> S4["4. ESLint Static Analysis"]
    S4 --> S5["5. Docker Build (multi-stage)"]
    S5 --> S6["6. Trivy Security Scan"]
    S6 --> S7["7. Push to ECR"]
    S7 --> S8["8. kubectl apply to EKS"]
    S8 --> S9["9. Smoke Tests"]
    S9 --> Done["Deploy Complete"]
```

---

## 9. Observability Architecture

```mermaid
flowchart TB
    subgraph Apps["Application Layer"]
        MS["Microservices<br/>/metrics endpoint"]
    end

    subgraph Metrics["Metrics Stack"]
        Prom["Prometheus<br/>scrape 15s interval"]
        Graf["Grafana<br/>Dashboards JSON"]
        AM["Alertmanager"]
    end

    subgraph Logs["Logging Stack"]
        FB["Filebeat<br/>DaemonSet"]
        LS["Logstash"]
        ES["Elasticsearch"]
        KB["Kibana"]
    end

    MS -->|/metrics| Prom
    Prom --> Graf
    Prom --> AM
    MS -->|stdout JSON logs| FB
    FB --> LS --> ES --> KB
```

### Key Metrics
| Metric | Source | Alert Threshold |
|--------|--------|-----------------|
| CPU Usage | cAdvisor / kube-state-metrics | > 80% for 5m |
| Memory Usage | cAdvisor | > 85% for 5m |
| API Request Rate | Express prometheus middleware | baseline + 3σ |
| API Latency p99 | Histogram | > 500ms |
| Error Rate | HTTP 5xx counter | > 1% |
| Active Users | Passenger service gauge | informational |
| Ticket Creation Rate | Ticketing counter | informational |
| GPS Events/sec | GPS service counter | > 10k/s spike alert |

---

## 10. Security Architecture

```mermaid
flowchart TB
    subgraph Perimeter["Perimeter Security"]
        WAF["AWS WAF (optional)"]
        RL["Rate Limiting - Redis"]
    end

    subgraph Auth["Authentication"]
        JWT["JWT RS256 / HS256"]
        IV["Input Validation - express-validator"]
    end

    subgraph K8sSec["Kubernetes Security"]
        RBAC2["RBAC Roles"]
        SA2["Service Accounts"]
        NP3["Network Policies"]
        SecCtx["Pod Security Context<br/>runAsNonRoot, readOnlyRootFilesystem"]
    end

    subgraph ContainerSec["Container Security"]
        Trivy["Trivy Scan in CI"]
        MSB["Multi-stage builds"]
        NoRoot["Non-root USER in Dockerfile"]
    end

    subgraph Secrets["Secret Management"]
        K8sSec["Kubernetes Secrets"]
        NoHardcode["No credentials in code"]
    end

    Perimeter --> Auth --> K8sSec --> ContainerSec --> Secrets
```

---

## 11. High Availability & Fault Tolerance

| Concern | Mitigation |
|---------|------------|
| Traffic spikes | HPA (3–10 replicas), Redis cache, Kafka buffering |
| Container crashes | Liveness probes, restartPolicy Always, 3+ replicas |
| Node failures | Pod anti-affinity across AZs, EKS managed node groups |
| Deployment failures | Rolling updates, readiness probes, automatic rollback |
| Database outages | Connection pooling, retry with exponential backoff, daily S3 backups |
| Kafka broker failure | Replication factor 3 (prod), min.in.sync.replicas=2 |
| Cybersecurity | JWT, rate limiting, Trivy, RBAC, NetworkPolicies, input validation |

---

## 12. Disaster Recovery

```mermaid
flowchart LR
    MySQL2["MySQL Primary"] --> Cron["K8s CronJob<br/>Daily 02:00 UTC"]
    Cron --> Dump["mysqldump + gzip"]
    Dump --> S3["S3 Bucket<br/>30-day lifecycle"]
    S3 --> Restore["Restore Procedure<br/>scripts/restore.sh"]
    Restore --> MySQL3["New MySQL Instance"]
```

**RTO Target**: 4 hours | **RPO Target**: 24 hours (daily backups)

---

## 13. Technology Stack Summary

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, TypeScript, Axios |
| Backend | Node.js 20 LTS, Express 4 |
| Database | MySQL 8.0 |
| Cache | Redis 7 |
| Messaging | Apache Kafka 3.x (KRaft mode in Compose) |
| Containers | Docker multi-stage builds |
| Orchestration | Kubernetes 1.28+ / EKS |
| IaC | Terraform 1.6+ |
| CI/CD | Jenkins 2.x |
| Monitoring | Prometheus, Grafana, Alertmanager |
| Logging | ELK + Filebeat |
| Security Scanning | Trivy |
| Testing | Jest, Supertest, k6 |

---

## 14. Design Decisions (DevOps Rationale)

1. **Microservices over monolith**: Independent scaling of GPS ingestion vs. ticketing; fault isolation for university demo of distributed systems.
2. **Kafka for GPS/events**: Handles telemetry bursts without blocking HTTP handlers; enables replay for analytics.
3. **Redis for sessions + rate limits**: Sub-millisecond auth checks; protects APIs during spikes.
4. **Separate DB schemas per service**: Database-per-service pattern; avoids tight coupling (shared MySQL instance in dev, separate RDS in prod).
5. **Multi-stage Docker builds**: Smaller attack surface, faster pulls, non-root runtime.
6. **Minimum 3 replicas**: Survives single pod failure; required for meaningful HPA and rolling update demos.
7. **Terraform module layout**: Reusable VPC/EKS modules across dev/staging/prod environments.
8. **Prometheus pull model**: Industry standard for K8s; `/metrics` on every service.
9. **JSON structured logging**: Enables ELK parsing and correlation by `traceId`.
10. **Jenkins over GitHub Actions**: Explicit requirement; EC2 Jenkins mirrors enterprise on-prem CI/CD patterns.

---

## 15. Next Steps

After architecture approval, implementation proceeds in this order:

1. Shared libraries + database init scripts
2. Microservices (Passenger first → JWT → others)
3. Frontend React app
4. Docker Compose for local stack
5. Kubernetes manifests
6. Terraform modules
7. Jenkins pipeline
8. Monitoring & logging configs
9. Tests & load scripts
10. Documentation guides

See [PROJECT_STRUCTURE.md](../PROJECT_STRUCTURE.md) for the complete file tree.
