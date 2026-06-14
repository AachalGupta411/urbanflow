# Monitoring Guide – UrbanFlow

## Stack Components

| Component | Purpose | Port (local) |
|-----------|---------|--------------|
| Prometheus | Metrics collection | 9090 |
| Grafana | Dashboards & visualization | 3000 |
| Alertmanager | Alert routing (K8s prod) | 9093 |

## Metrics Exposed

Every microservice exposes Prometheus metrics at `GET /metrics`:

| Metric | Type | Description |
|--------|------|-------------|
| `http_requests_total` | Counter | Total HTTP requests by method, route, status |
| `http_request_duration_seconds` | Histogram | Request latency distribution |
| `process_cpu_seconds_total` | Counter | CPU time |
| `process_resident_memory_bytes` | Gauge | Memory usage |

### Business Metrics (derived)

- **Ticket Creation Rate**: `rate(http_requests_total{service="ticketing-service", method="POST"})`
- **GPS Events/sec**: `rate(http_requests_total{service="gps-service", method="POST"})`
- **Active Users**: `rate(http_requests_total{service="passenger-service", route=~".*login.*"})`

## Grafana Dashboards

Pre-built dashboards in `monitoring/grafana/dashboards/`:

| Dashboard | File | Panels |
|-----------|------|--------|
| UrbanFlow Overview | `urbanflow-overview.json` | Request rate, latency, errors, memory |
| Business Metrics | `business-metrics.json` | Tickets, GPS events, logins |

### Import Manually

1. Open Grafana → Dashboards → Import
2. Upload JSON from `monitoring/grafana/dashboards/`
3. Select Prometheus datasource

### Auto-provisioned (Docker Compose)

Dashboards load automatically via `monitoring/grafana/provisioning/dashboards.yaml`.

## Alert Rules

Defined in `monitoring/prometheus/alert-rules.yml`:

| Alert | Condition | Severity |
|-------|-----------|----------|
| HighCpuUsage | CPU > 80% for 5m | warning |
| HighMemoryUsage | Memory > 400MB for 5m | warning |
| HighErrorRate | 5xx rate > 1% for 2m | critical |
| HighLatency | p99 > 500ms for 5m | warning |

## Access

```bash
# Local
open http://localhost:3000    # Grafana (admin/admin)
open http://localhost:9090    # Prometheus

# Query example in Prometheus
rate(http_requests_total[5m])
```

## Kubernetes Monitoring

In production, deploy Prometheus Operator or use the monitoring EC2 instance from Terraform. ServiceMonitor resources can scrape pods in the `urbanflow` namespace.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| No metrics in Grafana | Verify Prometheus targets: http://localhost:9090/targets |
| Empty dashboards | Ensure services are running and receiving traffic |
| High cardinality | Route labels are normalized to Express route paths |
