#!/usr/bin/env bash
# Restore MySQL from backup file
set -euo pipefail

if [ $# -lt 2 ]; then
  echo "Usage: $0 <database_name> <backup_file.sql.gz>"
  echo "Example: $0 passenger_db ./backups/passenger_db_20260614_020000.sql.gz"
  exit 1
fi

DB="$1"
BACKUP="$2"
MYSQL_HOST="${MYSQL_HOST:-localhost}"
MYSQL_USER="${MYSQL_USER:-urbanflow}"
MYSQL_PASSWORD="${MYSQL_PASSWORD:-urbanflow_pass}"

if [ ! -f "$BACKUP" ]; then
  echo "ERROR: Backup file not found: $BACKUP"
  exit 1
fi

echo "Restoring $DB from $BACKUP..."
gunzip -c "$BACKUP" | mysql -h "$MYSQL_HOST" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$DB"
echo "Restore complete."
