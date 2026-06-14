# Security Guide – UrbanFlow

## Security Layers

```
Perimeter → Authentication → Authorization → Container → Network → Secrets
```

---

## API Security

### JWT Authentication
- Tokens issued by Passenger Service (HS256, 24h expiry)
- Protected routes require `Authorization: Bearer <token>`
- Secret stored in Kubernetes Secret (`JWT_SECRET`), never in code

### Rate Limiting
- Redis-backed: 100 requests/minute per IP
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`
- Fail-open if Redis unavailable (availability priority)

### Input Validation
- `express-validator` on all POST/PUT endpoints
- SQL parameterized queries via `mysql2` prepared statements
- No raw user input in SQL strings

---

## Container Security

### Multi-Stage Builds
- Build stage: full Node.js with dev dependencies
- Production stage: minimal Alpine, production deps only

### Non-Root Runtime
```dockerfile
RUN adduser -S -u 1001 urbanflow
USER urbanflow
```

### Trivy Scanning
- Runs in Jenkins pipeline stage 6
- Fails on CRITICAL unfixed vulnerabilities
- Scan command: `trivy image --severity CRITICAL,HIGH --exit-code 1`

---

## Kubernetes Security

### RBAC
- Per-service ServiceAccounts in `kubernetes/rbac/`
- Least-privilege Roles (read ConfigMaps, no cluster-admin)
- RoleBindings scoped to `urbanflow` namespace

### Network Policies
| Policy | Effect |
|--------|--------|
| `default-deny` | Block all ingress/egress by default |
| `allow-ingress` | Allow traffic from NGINX Ingress Controller |
| `allow-internal` | Allow inter-service communication within namespace |

### Pod Security
- `runAsNonRoot: true`
- `readOnlyRootFilesystem: false` (Node.js requires write to /tmp)
- Resource limits prevent noisy neighbor attacks

---

## Secret Management

### Never Hardcode
- All credentials via environment variables
- Kubernetes Secrets for production
- `.example` files in repo; real secrets gitignored

### Secret Files
```bash
kubernetes/secrets/app-secrets.yaml.example   # JWT, API keys
kubernetes/secrets/mysql-secrets.yaml.example  # DB credentials
```

### Rotation
- Rotate JWT secret: update K8s Secret → rolling restart all services
- Rotate DB password: update Secret → restart MySQL + services
- Rotate AWS keys: update Jenkins credentials

---

## GPS API Key

GPS coordinate ingestion accepts `X-API-Key` header for device telemetry (separate from JWT):

```
GPS_API_KEY=urbanflow-gps-dev-key  # Change in production
```

---

## Security Checklist for Production

- [ ] Change all default passwords (MySQL, Grafana, JWT secret)
- [ ] Enable TLS on Ingress (cert-manager or ACM)
- [ ] Restrict Jenkins security group to office/VPN CIDR
- [ ] Enable AWS WAF on ALB (optional)
- [ ] Configure S3 bucket encryption and block public access
- [ ] Enable EKS control plane logging
- [ ] Run Trivy scan before every deploy
- [ ] Review NetworkPolicy rules after adding new services

---

## Incident Response

1. Identify affected service via Grafana error rate alerts
2. Check Kibana logs for attack patterns (rate limit 429s, auth failures)
3. Block offending IP at ALB/WAF level
4. Rotate compromised secrets
5. Review and patch vulnerability via CI/CD pipeline
