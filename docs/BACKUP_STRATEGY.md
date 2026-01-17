# Internet Madrasha - Backup & Recovery Strategy

## 1. Database Backup (PostgreSQL)

The system relies on a relational PostgreSQL database. Backups must be taken daily.

### Automated Backup Script (Linux/Cron)
Create a script `backup_db.sh`:

```bash
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/madrasa"
DB_NAME="madrasa_db"
DB_USER="postgres"

# Create backup
pg_dump -U $DB_USER -F c -b -f "$BACKUP_DIR/db_backup_$TIMESTAMP.sql" $DB_NAME

# Keep only last 30 days
find $BACKUP_DIR -type f -name "*.sql" -mtime +30 -delete
```

### Manual Restore Procedure
To restore the database from a backup file:

```bash
# 1. Stop the application
pm2 stop madrasa-app

# 2. Drop existing database (CAUTION)
dropdb -U postgres madrasa_db

# 3. Create fresh database
createdb -U postgres madrasa_db

# 4. Restore
pg_restore -U postgres -d madrasa_db -v "/var/backups/madrasa/db_backup_20240101.sql"

# 5. Restart application
pm2 start madrasa-app
```

## 2. Media Assets

Student photos and homework attachments are stored in the filesystem or cloud storage (depending on final configuration).

- **Location**: `public/uploads` (or configured S3 bucket)
- **Strategy**: Sync this directory to a remote location daily.
- **Command**: `rsync -avz /var/www/madrasa/public/uploads /mnt/backup_drive/uploads`

## 3. Disaster Recovery Scenario

In case of total server failure:
1. Provision new server (Ubuntu LTS recommended).
2. Install Node.js 18+, PostgreSQL 16, Nginx.
3. Clone repository and run `npm install && npm run build`.
4. Restore Database using the command above.
5. Restore `.env` file (Keep a secure offline copy!).
6. Restore `public/uploads`.
7. Update DNS records if IP changed.
