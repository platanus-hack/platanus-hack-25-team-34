# Data Model Change Protocol

## Overview
This document establishes the required workflow whenever a data model is modified in the Hedgie application. Following this protocol ensures consistency across the entire codebase and prevents breaking changes.

## Change Propagation Checklist

Whenever you modify a data model (SQLModel class in `/backend/app/models/`), you MUST update the following components in order:

### 1. **Database Models** (`/backend/app/models/*.py`)
- Update the SQLModel class definition
- Add/modify Field descriptions
- Update type annotations
- Add validation logic if needed

### 2. **Seed Data** (`/backend/app/seed_data/*.json`)
- Update JSON files to match new schema
- Ensure all required fields are present
- Add default values for new fields
- Remove deprecated fields

### 3. **Database Migration** (if schema changed)
```bash
# Generate a new migration
alembic revision --autogenerate -m "Description of change"

# Review the generated migration in backend/alembic/versions/
# Apply the migration
alembic upgrade head
```

### 4. **Services** (`/backend/app/services/*.py`)
- Update service methods that use the modified model
- Adjust business logic if field semantics changed
- Update any calculations or validations

### 5. **API Endpoints** (`/backend/app/api/*.py`)
- Update Pydantic request/response models if needed
- Modify endpoint logic to handle new fields
- Update API documentation strings

### 6. **Tests** (`/backend/tests/`)
- Update unit tests for the model
- Update service layer tests
- Update API endpoint tests
- Add tests for new fields/behavior

### 7. **Frontend Types** (`/frontend/src/types/`)
- Update TypeScript interfaces to match backend models
- Ensure type safety across API calls

### 8. **Frontend Components** (`/frontend/src/`)
- Update components that display the modified data
- Add UI for new fields
- Remove UI for deprecated fields

### 9. **Documentation** (`/docs/`)
- Update technical documentation
- Document the reason for the change
- Note any breaking changes or migration steps

## Example: Adding `average_delay` to Tracker

### Step-by-step execution:

1. **Model Update** (`backend/app/models/tracker.py`):
```python
average_delay: int = Field(default=45, description="Average reporting delay in days")
```

2. **Seed Data** (`backend/app/seed_data/trackers.json`):
```json
"average_delay": 45
```

3. **Migration**:
```bash
alembic revision --autogenerate -m "Add average_delay to Tracker"
alembic upgrade head
```

4. **Services** - No changes needed (field is informational only)

5. **API** - Automatically handled by FastAPI (Tracker model is used directly)

6. **Tests** - Update tracker creation fixtures:
```python
def test_tracker_has_average_delay():
    tracker = Tracker(name="Test", type="fund", average_delay=30, ...)
    assert tracker.average_delay == 30
```

7. **Frontend Types** (`frontend/src/types/tracker.ts`):
```typescript
interface Tracker {
  // ... existing fields
  average_delay: number;
}
```

8. **Frontend Components** - Add display logic where needed

9. **Documentation** - Document in `/docs/track2_data_models.md`

## Critical Reminders

- **Never** modify the database directly - always use migrations
- **Always** re-run the seed script after schema changes: `python -m app.seed`
- **Test** the entire flow after making changes: API → Service → Database
- **Review** the auto-generated migration before applying it
- **Commit** related changes together (model + seed + migration + tests)

## Breaking Changes

If a change is breaking (removes a field, changes type, etc.):
1. Document it clearly in commit message
2. Add a migration note in `/docs/`
3. Consider a deprecation period if possible
4. Update all frontend code before deploying

## Quick Reference Commands

```bash
# Generate migration after model change
alembic revision --autogenerate -m "Your message"

# Apply migration
alembic upgrade head

# Rollback last migration
alembic downgrade -1

# Re-seed database
python -m app.seed

# Run tests
pytest

# Check for errors
docker-compose logs backend
```
