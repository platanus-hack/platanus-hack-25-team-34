"""
Database Seeding Script

This script is used for DEVELOPMENT purposes only to populate the database with initial mock data.

Purpose:
- Quickly set up a working database with test data
- Reset the database to a known state during development
- Provide consistent mock data for testing the application

When to use:
- After creating/migrating the database schema
- When you need to reset to clean mock data
- When onboarding new developers

How to run:
    python -m app.seed

What it does:
1. Creates all database tables (if they don't exist)
2. Seeds 3 mock users with different CLP balances
3. Seeds 2 trackers (Nancy Pelosi, Warren Buffett) with their holdings

Note: This script is idempotent - running it multiple times won't create duplicates.
It checks if records exist before inserting.
"""
import json
import os
from sqlmodel import Session, select
from app.core.db import engine, create_db_and_tables
from app.models import User, Tracker, TrackerHolding

def seed_users(session: Session):
    """
    Populate the database with mock users from users.json.
    
    Creates 3 users with different balance levels:
    - User 1: 1,000,000 CLP (wealthy investor)
    - User 2: 20,000 CLP (small investor) 
    - User 3: 100,000 CLP (medium investor)
    
    These different balance levels allow testing various investment scenarios.
    """
    file_path = os.path.join(os.path.dirname(__file__), "seed_data/users.json")
    with open(file_path) as f:
        users_data = json.load(f)
    
    for user_data in users_data:
        # Check if user already exists (idempotent operation)
        user = session.exec(select(User).where(User.name == user_data["name"])).first()
        if not user:
            print(f"Creating user: {user_data['name']}")
            user = User(**user_data)
            session.add(user)
    session.commit()

def seed_trackers(session: Session):
    """
    Populate the database with mock trackers (strategies) from trackers.json.
    
    Creates 2 trackers with different profiles:
    - Nancy Pelosi: High-risk politician tracker (tech-heavy portfolio)
    - Warren Buffett: Low-risk fund tracker (value investing)
    
    Each tracker includes:
    - Metadata (name, type, avatar, description, YTD return, risk level)
    - Holdings (portfolio composition with allocation percentages)
    
    The holdings define what stocks are "bought" when a user invests in the tracker.
    """
    file_path = os.path.join(os.path.dirname(__file__), "seed_data/trackers.json")
    with open(file_path) as f:
        trackers_data = json.load(f)
    
    for tracker_data in trackers_data:
        # Extract holdings to insert separately (relational data)
        holdings_data = tracker_data.pop("holdings", [])
        
        # Check if tracker already exists (idempotent operation)
        tracker = session.exec(select(Tracker).where(Tracker.name == tracker_data["name"])).first()
        if not tracker:
            print(f"Creating tracker: {tracker_data['name']}")
            tracker = Tracker(**tracker_data)
            session.add(tracker)
            session.commit()
            session.refresh(tracker)  # Get the auto-generated ID
            
            # Create holdings linked to this tracker
            for holding_data in holdings_data:
                holding = TrackerHolding(**holding_data, tracker_id=tracker.id)
                session.add(holding)
            session.commit()

def main():
    """
    Main seeding orchestration.
    
    Order matters: Users and Trackers must exist before any investments can be made.
    In the future, if we add portfolio seeding, it would go after this.
    """
    print("Creating DB and tables...")
    create_db_and_tables()
    
    with Session(engine) as session:
        print("Seeding users...")
        seed_users(session)
        print("Seeding trackers...")
        seed_trackers(session)
    
    print("Seeding complete.")
    print("\nMock data available:")
    print("  - Users: 3 (User 1, User 2, User 3)")
    print("  - Trackers: 2 (Nancy Pelosi, Warren Buffett)")
    print("\nYou can now test the application with this data.")

if __name__ == "__main__":
    main()
