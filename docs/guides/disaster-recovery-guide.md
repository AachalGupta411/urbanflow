# Disaster Recovery Guide – UrbanFlow

## Recovery Objectives

| Metric | Target |
|--------|--------|
| RPO (Recovery Point Objective) | 24 hours (daily backups) |
| RTO (Recovery Time Objective) | 4 hours |

---

## Backup Strategy

### Automated (Kubernetes CronJob)

Daily backup at **02:00 UTC** via `kubernetes/backup/mysql-backup-cronjob.yaml`:

1. Init container runs `mysqldump` for all databases
2. Compresses with gzip
3. Uploads to S3 bucket (`AWS_S3_BACKUP_BUCKET`)

### Manual Backup

```bash
./scripts/backup-mysql.sh
# Output: ./backups/{database}_{timestamp}.sql.gz
```

### S3 Lifecycle

Terraform configures 30-day retention on the backup bucket with versioning enabled.

---

## Database Restore

### From Local Backup

```bash
./scripts/restore-mysql.sh passenger_db ./backups/passenger_db_20260614_020000.sql.gz
```

### From S3 (Production)

```bash
aws s3 cp s3://urbanflow-backups-dev/mysql/2026-06-14/passenger_db.sql.gz ./
gunzip -c passenger_db.sql.gz | mysql -h $MYSQL_HOST -u urbanflow -p passenger_db
```

Repeat for each database: `passenger_db`, `ticketing_db`, `gps_db`, `notification_db`, `analytics_db`.

---

## Cluster Recovery

### EKS Cluster Failure

1. Run Terraform to recreate cluster:
   ```bash
   cd terraform/environments/prod
   terraform apply
   ```
2. Update kubeconfig:
   ```bash
   aws eks update-kubeconfig --name urbanflow-prod --region us-east-1
   ```
3. Redeploy application:
   ```bash
   ./scripts/deploy-k8s.sh
   ```
4. Restore databases from S3
5. Run smoke tests:
   ```bash
   ./scripts/smoke-test.sh
   ```

### Node Failure

EKS managed node groups auto-replace failed nodes. Pods reschedule automatically due to 3-replica deployments and pod anti-affinity.

Verify:
```bash
kubectl get nodes
kubectl get pods -n urbanflow -o wide
```

---

## Pod Recovery

Kubernetes self-heals crashed pods via liveness probes and `restartPolicy: Always`.

Manual intervention:
```bash
kubectl delete pod <pod-name> -n urbanflow          # Force restart
kubectl rollout restart deployment/ticketing-service -n urbanflow
kubectl rollout undo deployment/ticketing-service -n urbanflow  # Rollback bad deploy
```

---

## Kafka Recovery

Kafka retains events based on retention policy. If Kafka data is lost:

1. Restart Kafka StatefulSet
2. Analytics and Notification services will resume consuming from latest offset
3. Historical aggregates may need backfill from MySQL source tables

---

## Recovery Checklist

- [ ] Identify failure scope (DB, cluster, node, pod)
- [ ] Notify stakeholders
- [ ] Restore databases from latest S3 backup
- [ ] Verify EKS cluster health
- [ ] Redeploy application manifests
- [ ] Run smoke tests
- [ ] Verify Grafana metrics and Kibana logs
- [ ] Document incident and root cause

---

## Testing DR Procedures

Quarterly DR drill:

```bash
# 1. Take backup
./scripts/backup-mysql.sh

# 2. Simulate data loss
docker compose down -v

# 3. Restart fresh
docker compose up -d

# 4. Restore
./scripts/restore-mysql.sh passenger_db ./backups/passenger_db_*.sql.gz

# 5. Verify
./scripts/smoke-test.sh
```
