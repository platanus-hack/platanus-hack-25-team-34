"""
Alembic Migration Environment Configuration

This file configures how Alembic generates and applies database migrations.
Alembic is the migration tool used by SQLAlchemy to manage schema changes over time.
"""
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool
from sqlmodel import SQLModel

from alembic import context

# Add the parent directory to sys.path so we can import our app modules
import sys
from os.path import dirname, abspath
sys.path.insert(0, dirname(dirname(abspath(__file__))))

# Import settings to get DATABASE_URL dynamically from environment variables
from app.core.config import settings

# Import all models so SQLModel.metadata knows about them
# This is critical: Alembic needs to see all model definitions to detect schema changes
from app.models import *  # Import all models

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Tell Alembic about our SQLModel metadata
# This metadata contains all table definitions from our models
# Alembic compares this metadata with the actual database to detect changes
target_metadata = SQLModel.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.

def get_url():
    """
    Get the database URL from our settings.
    This allows us to use environment variables instead of hardcoding in alembic.ini
    """
    return settings.DATABASE_URL

def run_migrations_offline() -> None:
    """
    Run migrations in 'offline' mode.
    
    OFFLINE MODE: Generates SQL scripts without executing them.
    Use case: When you don't have direct database access, or want to review SQL before applying.
    
    How it works:
    - Alembic generates raw SQL statements based on model changes
    - SQL is printed to stdout (or a file)
    - No database connection is established
    - You can manually execute the SQL later
    
    Example usage:
        alembic upgrade head --sql > migration.sql
    """
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,  # Embed parameter values directly in SQL
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """
    Run migrations in 'online' mode.
    
    ONLINE MODE: Connects to the database and executes migrations directly.
    Use case: Normal development and production workflows.
    
    How it works:
    - Alembic connects to the database using DATABASE_URL
    - Compares current schema with target_metadata (our models)
    - Executes SQL statements to update the schema
    - Updates alembic_version table to track migration history
    
    Example usage:
        alembic upgrade head
        alembic downgrade -1
    """
    # Override the database URL from alembic.ini with our settings
    configuration = config.get_section(config.config_ini_section)
    configuration["sqlalchemy.url"] = get_url()
    
    # Create a database connection engine
    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,  # Don't pool connections for migrations
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, 
            target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


# Determine which mode to use based on context
# Most of the time, this will run in online mode (with database connection)
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
