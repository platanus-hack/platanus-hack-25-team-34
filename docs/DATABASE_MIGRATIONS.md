# Database Migrations & Alembic - Current Setup

## TL;DR - What Happens Now

**Current Behavior:**
- ❌ **Alembic migrations are NOT run automatically**
- ✅ **Tables are created via SQLModel on startup** (`create_db_and_tables()`)
- ✅ **Mock data is seeded on every startup** (`app.seed.main()`)
- ⚠️ **Manual migration required** if you want to use Alembic

## What Happens on `docker-compose up`

### Step-by-Step Process

1. **Database Container Starts**
   - PostgreSQL initializes with empty database `hedgie_db`
   - If volume `postgres_data` exists, uses existing data
   - If fresh start (after `docker-compose down -v`), database is empty

2. **Backend Container Starts**
   - Dockerfile: `CMD ["uvicorn", "app.main:app", ...]`
   - FastAPI imports `app.main`
   - `main.py` immediately calls `app.seed.main()`

3. **Seed Script Runs** (`app/seed.py`)
   ```python
   def main():
       create_db_and_tables()  # Creates ALL tables from SQLModel definitions
       seed_users()            # Inserts 3 mock users (if not exist)
       seed_trackers()         # Inserts 2 trackers with holdings (if not exist)
   ```

4. **Result**
   - ✅ All tables exist (created from Python models)
   - ✅ Mock data loaded
   - ❌ Alembic migrations NOT applied
   - ❌ `alembic_version` table NOT created

## What Happens on `docker-compose down`

### Without `-v` Flag (Default)
```bash
docker-compose down
```
- Stops and removes containers
- **Keeps** the `postgres_data` volume
- **Database persists** - all data remains
- Next `docker-compose up` uses existing database

### With `-v` Flag (Nuclear Option)
```bash
docker-compose down -v
```
- Stops and removes containers
- **Deletes** the `postgres_data` volume
- **Database wiped completely**
- Next `docker-compose up` starts fresh

## Current Architecture: SQLModel vs Alembic

### What We're Using Now: **SQLModel Auto-Creation**

**Location:** `app/core/db.py`
```python
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
```

**How it works:**
- Reads Python model definitions (`User`, `Tracker`, etc.)
- Generates `CREATE TABLE` SQL automatically
- Executes on every startup
- **Safe**: Won't recreate existing tables (idempotent)

**Called from:** `app.seed.main()` → runs when FastAPI starts

### What We're NOT Using: **Alembic Migrations**

**Location:** `backend/alembic/versions/c36b439e21c7_*.py`

**Status:** 
- ✅ Migration file exists
- ❌ Never executed automatically
- ❌ Would fail if run (tries to ALTER non-existent tables)

**The migration file:**
```python
# alembic/versions/c36b439e21c7_*.py
def upgrade():
    op.add_column('tracker', sa.Column('ytd_return', sa.Float(), nullable=False))
    op.add_column('tracker', sa.Column('average_delay', sa.Integer(), nullable=False))
```

**Why it fails:**
- Assumes tables already exist
- Tries to ADD columns to existing `tracker` table
- But SQLModel already created the table WITH those columns
- Migration is redundant

## Migration Strategies

### Strategy 1: Current Approach (SQLModel Only) ✅ **ACTIVE**

**Pros:**
- Simple, no manual migration steps
- Works for MVP/development
- Tables always match Python models
- Automatic on every startup

**Cons:**
- Can't track schema history
- Can't rollback changes
- No production-safe migration path
- Dangerous for production data

**When to use:**
- Early development (MVP stage) ✅ **YOU ARE HERE**
- Prototyping
- Throwaway databases

### Strategy 2: Alembic-First (Proper Production Setup)

**How it would work:**
1. Remove `create_db_and_tables()` from `seed.py`
2. Run migrations manually or via entrypoint script
3. Keep `seed.py` for mock data only

**Implementation:**
```bash
# Manual approach (current workaround)
docker-compose exec backend alembic upgrade head
docker-compose exec backend python -m app.seed
```

**Pros:**
- Production-safe
- Version-controlled schema
- Rollback capability
- Team collaboration friendly

**Cons:**
- Requires manual steps
- More complex setup
- Need entrypoint script for automation

### Strategy 3: Hybrid (Recommended for Production)

**Setup:**
1. Create `backend/entrypoint.sh`:
   ```bash
   #!/bin/bash
   # Run migrations
   alembic upgrade head
   
   # Seed data (development only)
   if [ "$ENV" = "development" ]; then
       python -m app.seed
   fi
   
   # Start server
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

2. Update `Dockerfile`:
   ```dockerfile
   COPY entrypoint.sh .
   RUN chmod +x entrypoint.sh
   CMD ["./entrypoint.sh"]
   ```

3. Remove `app.seed.main()` from `main.py`

**Pros:**
- Automatic migrations on startup
- Production-ready
- Still works in development
- No manual steps

**Cons:**
- Slightly slower startup
- Need to manage entrypoint script

## Current Workflow

### Adding a New Field to a Model

**Current approach (no Alembic):**
1. Edit the model (e.g., add `tracker.new_field`)
2. `docker-compose down -v` (wipe database)
3. `docker-compose up` (recreates tables with new field)
4. All data lost, but tables match models

**Problem:** Destroys data every time

### Creating a New Table

**Current approach:**
1. Create new model file
2. Import in `app/models/__init__.py`
3. Import in `app/core/db.py`
4. Restart backend: `docker-compose restart backend`
5. SQLModel auto-creates the table

**Works well** for new tables (doesn't destroy data)

## When Do You Need Manual Migration?

### Scenarios Requiring `alembic upgrade head`

1. **If you switch to Alembic-first approach**
   - After removing `create_db_and_tables()`
   - When existing migration file is fixed

2. **Production deployment**
   - Can't afford to wipe database
   - Need version control
   - Multiple environments (staging, prod)

3. **Team collaboration**
   - Multiple developers
   - Need reproducible schema changes
   - Schema review process

### Current State: You DON'T Need Alembic

For Hedgie MVP:
- ✅ SQLModel auto-creation is fine
- ✅ `docker-compose down -v` for schema changes
- ✅ Fast iteration
- ❌ Don't use production data yet

## Commands Reference

### Current Commands

```bash
# Fresh start (wipe everything)
docker-compose down -v
docker-compose up -d

# Keep data, restart services
docker-compose restart backend

# View what's in database
docker-compose exec db psql -U hedgie -d hedgie_db -c "\dt"  # List tables
docker-compose exec db psql -U hedgie -d hedgie_db -c "SELECT * FROM tracker;"  # Query data

# Manual seed (if you removed auto-seeding)
docker-compose exec backend python -m app.seed
```

### Alembic Commands (NOT currently used)

```bash
# Check migration status
docker-compose exec backend alembic current

# Apply all migrations
docker-compose exec backend alembic upgrade head

# Rollback one migration
docker-compose exec backend alembic downgrade -1

# Create new migration
docker-compose exec backend alembic revision --autogenerate -m "description"
```

## Recommendations

### For MVP/Hackathon (Current Phase)
**Keep current approach:**
- ✅ Use SQLModel auto-creation
- ✅ Use `docker-compose down -v` for schema changes
- ✅ Auto-seed on startup
- ❌ Ignore Alembic for now

### Before Production
**Switch to Alembic + Separate Seed Strategy:**
1. Implement entrypoint script with migrations
2. Remove auto-seeding from `main.py`
3. Create production-safe seed data approach
4. Test migration workflow
5. Document for team

### Migration Path (When Ready)

1. **Backup current database**
   ```bash
   docker-compose exec db pg_dump -U hedgie hedgie_db > backup.sql
   ```

2. **Create initial migration**
   ```bash
   # Delete old migration
   rm backend/alembic/versions/*.py
   
   # Generate fresh migration from current models
   docker-compose exec backend alembic revision --autogenerate -m "initial schema"
   ```

3. **Test migration on fresh database**
   ```bash
   docker-compose down -v
   docker-compose up -d db
   docker-compose exec backend alembic upgrade head
   docker-compose exec backend python -m app.seed
   ```

4. **Update startup process** (add entrypoint.sh)

## Summary Table

| Aspect | Current Setup | Production Setup |
|--------|---------------|------------------|
| **Schema Creation** | SQLModel auto (`create_db_and_tables()`) | Alembic migrations |
| **On Startup** | Tables created + data seeded | Migrations run, seed optional |
| **Schema Changes** | `down -v` + `up` | Create migration + upgrade |
| **Data Safety** | ❌ Wipe on schema change | ✅ Preserved |
| **Version Control** | ❌ No history | ✅ Git-tracked migrations |
| **Team Work** | ⚠️ Manual coordination | ✅ Automated |
| **Rollback** | ❌ Not possible | ✅ `alembic downgrade` |
| **Complexity** | 🟢 Simple | 🟡 Moderate |
| **Current Status** | ✅ **ACTIVE** | ⏳ Not implemented |

## Files Involved

```
backend/
├── Dockerfile                  # No entrypoint script (yet)
├── alembic/
│   ├── env.py                 # Alembic config
│   └── versions/
│       └── c36b439e21c7_*.py # Unused migration
├── app/
│   ├── main.py               # Calls app.seed.main() on startup
│   ├── seed.py               # Creates tables + seeds data
│   └── core/
│       └── db.py             # create_db_and_tables() function
└── docker-compose.yml        # No custom CMD/entrypoint
```

---

## Production Deployment Strategy

### Overview

For production, you need:
1. **Persistent database** with version-controlled schema changes
2. **Seed data** that runs once, not on every restart
3. **Separation** between required data (trackers) and test data (mock users)
4. **Safe migrations** that don't destroy existing data

### Step-by-Step Production Setup

#### 1. Create Production Seed Data Structure

Organize seed data into two categories:

```
backend/app/seed_data/
├── production/           # Real data that MUST exist in production
│   ├── trackers.json    # Real trackers (Nancy Pelosi, Warren Buffett, etc.)
│   └── system_config.json  # App configuration
└── development/         # Test/mock data for dev only
    └── users.json       # Mock users (UserConPlata, etc.)
```

#### 2. Update Seed Script for Production

Create `backend/app/seed_production.py`:

```python
"""
Production Seed Script

This script should be run ONCE after deploying to production or staging.
It creates essential data that the application needs to function.

Usage:
    docker-compose exec backend python -m app.seed_production
    
Or via management command:
    python manage.py seed-production
"""
import json
import os
from sqlmodel import Session, select
from app.core.db import engine
from app.models import User, Tracker, TrackerHolding

def seed_production_trackers(session: Session):
    """
    Seed production trackers - these are the actual investment strategies
    users can follow in the app.
    
    Run this ONCE after initial deployment or when adding new trackers.
    """
    file_path = os.path.join(
        os.path.dirname(__file__), 
        "seed_data/production/trackers.json"
    )
    
    with open(file_path) as f:
        trackers_data = json.load(f)
    
    for tracker_data in trackers_data:
        holdings_data = tracker_data.pop("holdings", [])
        
        # Check if tracker exists by name (idempotent)
        tracker = session.exec(
            select(Tracker).where(Tracker.name == tracker_data["name"])
        ).first()
        
        if not tracker:
            print(f"Creating tracker: {tracker_data['name']}")
            tracker = Tracker(**tracker_data)
            session.add(tracker)
            session.commit()
            session.refresh(tracker)
            
            # Add holdings
            for holding_data in holdings_data:
                holding = TrackerHolding(**holding_data, tracker_id=tracker.id)
                session.add(holding)
            session.commit()
        else:
            print(f"Tracker already exists: {tracker_data['name']}")

def seed_admin_user(session: Session):
    """
    Create an admin/system user for operational purposes.
    
    In production, you'd likely integrate with Auth0 or similar,
    but this creates a fallback system account.
    """
    admin_email = os.getenv("ADMIN_EMAIL", "admin@hedgie.com")
    
    admin = session.exec(
        select(User).where(User.email == admin_email)
    ).first()
    
    if not admin:
        print(f"Creating admin user: {admin_email}")
        admin = User(
            name="System Admin",
            email=admin_email,
            balance_clp=0,  # Admin doesn't invest
            is_admin=True
        )
        session.add(admin)
        session.commit()
    else:
        print("Admin user already exists")

def main():
    """
    Run all production seed operations.
    
    This is safe to run multiple times - it won't duplicate data.
    """
    print("=== Production Seeding ===")
    print("Note: This should only be run once per environment\n")
    
    with Session(engine) as session:
        print("1. Seeding production trackers...")
        seed_production_trackers(session)
        
        print("\n2. Creating admin user...")
        seed_admin_user(session)
    
    print("\n=== Production Seeding Complete ===")
    print("Trackers are now available in the marketplace.")

if __name__ == "__main__":
    main()
```

#### 3. Create Development Seed Script

Update `backend/app/seed.py` to only run in development:

```python
"""
Development Seed Script

This creates mock data for testing. DO NOT run in production.
"""
import os
from sqlmodel import Session
from app.core.db import engine, create_db_and_tables
from app.models import User

def seed_dev_users(session: Session):
    """Create mock users for development/testing only"""
    # Only create if we're in development
    if os.getenv("ENV") == "production":
        print("Skipping dev users - production environment detected")
        return
    
    mock_users = [
        {"name": "UserConPlata", "balance_clp": 1000000},
        {"name": "UserPobre", "balance_clp": 20000},
        {"name": "UserNormal", "balance_clp": 100000}
    ]
    
    for user_data in mock_users:
        user = session.exec(
            select(User).where(User.name == user_data["name"])
        ).first()
        
        if not user:
            print(f"Creating dev user: {user_data['name']}")
            user = User(**user_data)
            session.add(user)
    
    session.commit()

def main():
    """
    Development seed - creates tables and mock data.
    
    In production, tables are created by Alembic migrations instead.
    """
    env = os.getenv("ENV", "development")
    
    if env == "development":
        print("=== Development Seeding ===")
        create_db_and_tables()
        
        with Session(engine) as session:
            seed_dev_users(session)
        
        print("Dev data seeded successfully")
    else:
        print("Skipping dev seed - not in development environment")

if __name__ == "__main__":
    main()
```

#### 4. Create Production Entrypoint Script

Create `backend/entrypoint.sh`:

```bash
#!/bin/bash
set -e

echo "=== Hedgie Backend Startup ==="

# Wait for database to be ready
echo "Waiting for database..."
while ! nc -z db 5432; do
  sleep 0.1
done
echo "Database is ready!"

# Run Alembic migrations
echo "Running database migrations..."
alembic upgrade head

# Seed production data if flag is set
if [ "$SEED_PRODUCTION" = "true" ]; then
    echo "Seeding production data..."
    python -m app.seed_production
    echo "Production seed complete"
fi

# Seed development data if in dev environment
if [ "$ENV" = "development" ]; then
    echo "Seeding development data..."
    python -m app.seed
    echo "Development seed complete"
fi

# Start the application
echo "Starting uvicorn server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 ${UVICORN_EXTRA_FLAGS}
```

Make it executable:
```bash
chmod +x backend/entrypoint.sh
```

#### 5. Update Dockerfile

Modify `backend/Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y libpq-dev gcc netcat-traditional && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Copy and set entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Use entrypoint script
ENTRYPOINT ["/entrypoint.sh"]
```

#### 6. Update docker-compose.yml for Environments

Create separate compose files:

**`docker-compose.yml`** (Base configuration):
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
    environment:
      - DATABASE_URL=${DATABASE_URL:-postgresql://hedgie:hedgie_pass@db:5432/hedgie_db}
      - BROKER_MODE=${BROKER_MODE:-mock}
      - ENV=${ENV:-development}
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    env_file:
      - ./frontend/.env
    depends_on:
      - backend

  db:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=${POSTGRES_USER:-hedgie}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-hedgie_pass}
      - POSTGRES_DB=${POSTGRES_DB:-hedgie_db}
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

**`docker-compose.dev.yml`** (Development overrides):
```yaml
version: '3.8'

services:
  backend:
    environment:
      - ENV=development
      - UVICORN_EXTRA_FLAGS=--reload
    # Auto-seed dev data on startup
    
  frontend:
    environment:
      - VITE_LOCAL_DEVELOPMENT=true
```

**`docker-compose.prod.yml`** (Production overrides):
```yaml
version: '3.8'

services:
  backend:
    environment:
      - ENV=production
      - SEED_PRODUCTION=false  # Set to 'true' only on first deploy
      - UVICORN_EXTRA_FLAGS=--workers 4
    # No volume mount in production (baked into image)
    volumes: []
    
  frontend:
    environment:
      - VITE_LOCAL_DEVELOPMENT=false
    volumes: []
```

#### 7. Update main.py

Remove auto-seeding from `backend/app/main.py`:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
# import app.seed  # REMOVED - no longer auto-seed
from app.api import trackers, invest, portfolio, auth

# app.seed.main()  # REMOVED - handled by entrypoint.sh

app = FastAPI(title=settings.PROJECT_NAME, version="0.1.0")

# ... rest of the file unchanged
```

#### 8. Create Initial Alembic Migration

Since you're starting fresh with Alembic:

```bash
# 1. Delete old migration
rm backend/alembic/versions/*.py

# 2. Start containers without running old code
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d db

# 3. Generate initial migration from current models
docker-compose exec backend alembic revision --autogenerate -m "initial schema"

# 4. Review the generated migration file
# Check backend/alembic/versions/XXXXX_initial_schema.py

# 5. Apply the migration
docker-compose exec backend alembic upgrade head

# 6. Seed production data
docker-compose exec backend python -m app.seed_production

# 7. Seed dev data (optional, for testing)
docker-compose exec backend python -m app.seed
```

### Production Deployment Workflow

#### First Deployment to Production

```bash
# 1. Set environment variables
export ENV=production
export DATABASE_URL=postgresql://user:pass@production-db:5432/hedgie_prod
export SEED_PRODUCTION=true  # Only for first deploy!

# 2. Deploy with production config
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# On first run, entrypoint.sh will:
# - Run alembic upgrade head (creates tables)
# - Run app.seed_production (creates trackers)
# - Start the server

# 3. Verify deployment
curl https://your-domain.com/api/v1/health
curl https://your-domain.com/api/v1/trackers/

# 4. IMPORTANT: Disable auto-seeding for subsequent restarts
# Update environment variable:
export SEED_PRODUCTION=false
# Or update docker-compose.prod.yml
```

#### Subsequent Deployments (Schema Changes)

```bash
# 1. Create migration locally
docker-compose exec backend alembic revision --autogenerate -m "add new field"

# 2. Review migration file
cat backend/alembic/versions/XXXXX_add_new_field.py

# 3. Test locally
docker-compose down -v
docker-compose up -d
# Verify migration works

# 4. Commit migration to git
git add backend/alembic/versions/
git commit -m "Migration: add new field"

# 5. Deploy to production
# On production server, pull latest code
git pull

# Restart services (entrypoint.sh runs migrations automatically)
docker-compose -f docker-compose.yml -f docker-compose.prod.yml restart backend

# Or rebuild if needed
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

### Adding New Trackers in Production

You have two options:

#### Option 1: Database Insert (Quick)

```bash
# Connect to production database
docker-compose exec db psql -U hedgie -d hedgie_db

# Insert new tracker
INSERT INTO tracker (name, type, avatar_url, description, ytd_return, average_delay, risk_level, followers_count)
VALUES ('Michael Burry', 'fund', 'https://...', 'The Big Short investor', 18.5, 60, 'medium', 3500);

# Get the tracker ID
SELECT id FROM tracker WHERE name = 'Michael Burry';

# Insert holdings
INSERT INTO trackerholding (tracker_id, ticker, company_name, allocation_percent)
VALUES 
  (3, 'GME', 'GameStop', 40.0),
  (3, 'TSLA', 'Tesla', 30.0),
  (3, 'META', 'Meta Platforms', 30.0);
```

#### Option 2: Update Seed Script (Proper)

```bash
# 1. Update production/trackers.json
# Add new tracker to the JSON file

# 2. Re-run production seed (safe, idempotent)
docker-compose exec backend python -m app.seed_production

# This won't duplicate existing trackers, only adds new ones
```

### Managing User Data

#### Development Users
- Created automatically in dev environment
- Wiped when you run `docker-compose down -v`
- Recreated on next startup

#### Production Users
- **Real users** created via Auth0 or registration flow
- **Persisted** in database
- Never auto-created or wiped
- Backed up regularly

#### Test Users in Production
If you need test accounts in production:

```bash
# Create via API or direct insert
docker-compose exec backend python -c "
from app.models import User
from app.core.db import engine
from sqlmodel import Session

with Session(engine) as session:
    test_user = User(
        name='Test Account',
        email='test@hedgie.com',
        balance_clp=100000,
        is_test=True  # Flag for filtering
    )
    session.add(test_user)
    session.commit()
    print(f'Created test user: {test_user.id}')
"
```

### Database Backup Strategy

#### Automated Backups

Add to production cron:

```bash
# Run daily at 2 AM
0 2 * * * docker-compose exec -T db pg_dump -U hedgie hedgie_db | gzip > /backups/hedgie_$(date +\%Y\%m\%d).sql.gz

# Keep last 30 days
find /backups -name "hedgie_*.sql.gz" -mtime +30 -delete
```

#### Manual Backup Before Migration

```bash
# Before running a risky migration
docker-compose exec db pg_dump -U hedgie hedgie_db > backup_before_migration_$(date +%Y%m%d_%H%M%S).sql

# Restore if needed
docker-compose exec -T db psql -U hedgie hedgie_db < backup_before_migration_YYYYMMDD_HHMMSS.sql
```

### Environment Variables Reference

#### Development (`.env.dev`)
```bash
ENV=development
DATABASE_URL=postgresql://hedgie:hedgie_pass@db:5432/hedgie_db
BROKER_MODE=mock
SEED_PRODUCTION=false
UVICORN_EXTRA_FLAGS=--reload
```

#### Production (`.env.prod`)
```bash
ENV=production
DATABASE_URL=postgresql://prod_user:secure_pass@prod-db.aws.com:5432/hedgie_production
BROKER_MODE=mock  # Change to 'real' when integrating real broker
SEED_PRODUCTION=false  # Only 'true' on first deploy
UVICORN_EXTRA_FLAGS=--workers 4
ADMIN_EMAIL=admin@hedgie.com
```

### Checklist for Production

- [ ] Remove `create_db_and_tables()` from startup
- [ ] Remove `app.seed.main()` from `main.py`
- [ ] Create `entrypoint.sh` with migration logic
- [ ] Update Dockerfile to use entrypoint
- [ ] Create separate seed scripts (production vs dev)
- [ ] Generate initial Alembic migration
- [ ] Test migration on fresh database
- [ ] Set up database backups
- [ ] Configure production environment variables
- [ ] Test deployment on staging environment
- [ ] Document rollback procedures
- [ ] Set `SEED_PRODUCTION=false` after first deploy

---

**Bottom Line:** Right now, you're using a simple "recreate everything on startup" approach. It's perfect for MVP, but you'll need to switch to proper Alembic migrations before deploying to production or when you can't afford to lose data. 

For production, you need:
1. **Alembic migrations** run via entrypoint script
2. **Production seed** (trackers) that runs once
3. **Development seed** (mock users) that only runs in dev
4. **Persistent volumes** that survive restarts
5. **No auto-recreation** of tables on startup
