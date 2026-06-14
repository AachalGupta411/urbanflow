# UrbanFlow Design Specification

**Date**: 2026-06-14  
**Status**: Approved for implementation  
**Author**: UrbanFlow DevOps Team

---

## 1. Problem Statement

Universities and transit agencies need a demonstrable, production-grade platform that shows modern DevOps practices applied to a real-world domain: public transportation. UrbanFlow addresses this by managing buses, metro, EV fleets, ticketing, GPS telemetry, and notifications at scale.

## 2. Goals

- Support millions of commuters (architecturally; demo runs locally)
- Withstand traffic spikes, infrastructure failures, and security threats
- Showcase: Terraform, Docker, Kubernetes, Jenkins, Prometheus, Grafana, ELK, Trivy
- Runnable locally via Docker Compose AND deployable to AWS EKS

## 3. Non-Goals

- Mobile native apps (web SPA only)
- Payment gateway integration (ticketing without payment processing)
- Multi-region active-active (single region with DR backups)

## 4. Architecture Choice: Modular Microservices

**Selected approach**: Five bounded-context microservices with Kafka event bus.

**Alternatives considered**:
| Approach | Pros | Cons | Decision |
|----------|------|------|----------|
| Monolith | Simpler deploy | Poor demo of K8s scaling, microservice isolation | Rejected |
| Microservices + Kafka | Realistic, scalable, event-driven | More moving parts | **Selected** |
| Serverless (Lambda) | Auto-scale | Harder local demo, less K8s showcase | Rejected |

## 5. Component Specifications

### 5.1 Ticketing Service
- **Endpoints**: POST/GET/DELETE `/api/tickets`, POST `/api/tickets/validate`
- **Events**: Publishes `ticket.created`, `ticket.cancelled` to Kafka
- **Auth**: JWT required for create/cancel; validate is public with ticket ID

### 5.2 Passenger Service
- **Endpoints**: POST `/api/passengers/register`, POST `/api/passengers/login`, GET/PUT `/api/passengers/profile`
- **Auth**: Issues JWT (HS256, 24h expiry)
- **Storage**: bcrypt password hashing (cost factor 12)

### 5.3 GPS Service
- **Endpoints**: POST `/api/gps/coordinates`, GET `/api/gps/vehicles/:id`, PUT `/api/gps/routes/:id`
- **Events**: Publishes `gps.coordinate`, `route.updated` to Kafka
- **Cache**: Latest position in Redis (30s TTL)

### 5.4 Notification Service
- **Endpoints**: GET `/api/notifications`, POST `/api/notifications/announce`
- **Consumers**: Kafka topics for delay alerts, route changes, system announcements
- **Types**: `delay`, `route_change`, `system`

### 5.5 Analytics Service
- **Endpoints**: GET `/api/analytics/passengers`, `/api/analytics/tickets`, `/api/analytics/routes`
- **Consumers**: Aggregates all Kafka event topics into MySQL stats tables
- **Cache**: Hourly aggregates in Redis

## 6. Infrastructure Specifications

### Terraform Modules
- **VPC**: 3 AZs, public + private + DB subnets, NAT gateways
- **EKS**: Managed node group, cluster autoscaler ready
- **IAM**: Least-privilege roles for EKS, nodes, Jenkins, S3 backup
- **EC2 Jenkins**: t3.medium, Docker + kubectl + aws-cli preinstalled
- **Monitoring EC2**: Optional Prometheus host for non-K8s scraping

### Kubernetes Requirements
- Namespace: `urbanflow`
- Min replicas: 3 per deployment
- Probes: `/health` (liveness), `/ready` (readiness)
- Resources: requests 128Mi/100m CPU, limits 512Mi/500m CPU
- HPA: target CPU 70%, min 3, max 10

## 7. CI/CD Pipeline

Nine stages as specified in master prompt. Trivy fails pipeline on CRITICAL vulnerabilities. Smoke tests hit `/health` on all services post-deploy.

## 8. Testing Strategy

| Type | Tool | Coverage Target |
|------|------|-----------------|
| Unit | Jest | Service business logic |
| Integration | Supertest + Docker Compose | API endpoints |
| Load | k6 | 100 VUs, ticket + GPS scenarios |

## 9. Security Controls

- JWT on protected routes
- Redis rate limiting: 100 req/min per IP
- express-validator on all inputs
- Trivy in CI pipeline
- K8s RBAC + NetworkPolicies
- Secrets via K8s Secrets / env injection
- Non-root containers

## 10. Disaster Recovery

- Daily MySQL backup CronJob at 02:00 UTC
- gzip compressed mysqldump to S3
- 30-day S3 lifecycle policy
- Documented restore via `scripts/restore-mysql.sh`

## 11. Success Criteria

- [ ] `docker compose up` starts full stack locally
- [ ] All 5 services pass health checks
- [ ] Jenkins pipeline completes all 9 stages
- [ ] Grafana dashboards show live metrics
- [ ] Kibana receives structured JSON logs
- [ ] k6 load test completes without error rate > 1%
- [ ] `terraform plan` succeeds for dev environment
- [ ] K8s manifests apply with 3 replicas each
