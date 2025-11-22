from sqlmodel import SQLModel, create_engine, Session
from app.core.config import settings
# Import models so they are registered with SQLModel.metadata
from app.models import User, Tracker, TrackerHolding, PortfolioItem, Transaction

# check_same_thread=False is needed only for SQLite. 
# It's not needed for Postgres, but we keep it compatible if using sqlite for dev.
connect_args = {"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}

engine = create_engine(settings.DATABASE_URL, echo=True, connect_args=connect_args)

def get_session():
    with Session(engine) as session:
        yield session

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
