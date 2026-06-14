# Deployment Guide – UrbanFlow

## Prerequisites

| Tool | Version |
|------|---------|
| Docker | 24+ |
| Docker Compose | v2+ |
| Node.js | 20 LTS |
| kubectl | 1.28+ |
| Terraform | 1.6+ |
| AWS CLI | v2 |

---

## Local Deployment (Docker Compose)

### Quick Start

```bash
chmod +x scripts/*.sh
./scripts/setup-local.sh
```

### Manual Steps

```bash
# Install dependencies
cd services/shared && npm install && cd ../..
for svc in ticketing-service passenger-service gps-service notification-service analytics-service; do
  (cd services/$svc && npm install)
done
cd frontend && npm install && cd ..

# Start stack
docker compose up -d --build

# Verify
./scripts/smoke-test.sh
```

### Access URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:8080 |
| Passenger API | http://localhost:3002 |
| Ticketing API | http://localhost:3001 |
| GPS API | http://localhost:3003 |
| Notification API | http://localhost:3004 |
| Analytics API | http://localhost:3005 |
| Grafana | http://localhost:3000 (admin/admin) |
| Prometheus | http://localhost:9090 |
| Kibana | http://localhost:5601 |

### Stop / Reset

```bash
docker compose down          # Stop containers
docker compose down -v       # Stop + remove volumes (fresh DB)
```

---

## Kubernetes Deployment

### 1. Prepare Secrets

```bash
cp kubernetes/secrets/app-secrets.yaml.example kubernetes/secrets/app-secrets.yaml
cp kubernetes/secrets/mysql-secrets.yaml.example kubernetes/secrets/mysql-secrets.yaml
# Edit with production values
```

### 2. Build and Push Images

```bash
./scripts/build-all.sh
# Tag and push to your registry
docker tag urbanflow/ticketing-service:latest <registry>/urbanflow/ticketing-service:latest
docker push <registry>/urbanflow/ticketing-service:latest
# Repeat for all services + frontend
```

### 3. Deploy

```bash
./scripts/deploy-k8s.sh
kubectl get pods -n urbanflow
./scripts/smoke-test.sh  # Update URLs to ingress host
```

### 4. Rolling Updates

```bash
kubectl set image deployment/ticketing-service \
  ticketing=urbanflow/ticketing-service:v2 -n urbanflow
kubectl rollout status deployment/ticketing-service -n urbanflow
```

### 5. Rollback

```bash
kubectl rollout undo deployment/ticketing-service -n urbanflow
```

---

## AWS Deployment (Terraform + EKS)

### 1. Create Remote State

```bash
aws s3 mb s3://urbanflow-terraform-state-dev
aws dynamodb create-table \
  --table-name urbanflow-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```

### 2. Provision Infrastructure

```bash
cd terraform/environments/dev
terraform init
terraform plan -out=tfplan
terraform apply tfplan
```

### 3. Configure kubectl

```bash
aws eks update-kubeconfig --name urbanflow-dev --region us-east-1
kubectl get nodes
```

### 4. Deploy Application

Follow Kubernetes deployment steps above.

---

## Health Checks

All services expose:

- `GET /health` — liveness (always returns 200 if process is running)
- `GET /ready` — readiness (checks MySQL, Redis, Kafka connectivity)
- `GET /metrics` — Prometheus metrics

```bash
curl http://localhost:3002/health
curl http://localhost:3002/ready
```
