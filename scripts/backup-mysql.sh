#!/usr/bin/env bash
# Manual MySQL backup to local file
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
MYSQL_HOST="${MYSQL_HOST:-localhost}"
MYSQL_USER="${MYSQL_USER:-urbanflow}"
MYSQL_PASSWORD="${MYSQL_PASSWORD:-urbanflow_pass}"

mkdir -p "$BACKUP_DIR"

DATABASES=(passenger_db ticketing_db gps_db notification_db analytics_db)

echo "Starting MySQL backup..."
for db in "${DATABASES[@]}"; do
  echo "  Backing up $db..."
  mysqldump -h "$MYSQL_HOST" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" \
    --single-transaction --routines "$db" | gzip > "$BACKUP_DIR/${db}_${TIMESTAMP}.sql.gz"
done

echo "Backup complete: $BACKUP_DIR/"
