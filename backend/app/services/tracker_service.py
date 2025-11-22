"""
Tracker Service

Handles business logic for Tracker-related operations.
"""
from typing import List, Optional
from sqlmodel import Session, select
from app.models import Tracker, TrackerHolding


class TrackerService:
    """
    Service for managing Tracker entities and their holdings.
    """
    
    def get_all_trackers(self, session: Session) -> List[Tracker]:
        """
        Fetch all available trackers (Marketplace view).
        """
        statement = select(Tracker)
        trackers = session.exec(statement).all()
        return list(trackers)
    
    def get_tracker_by_id(self, tracker_id: int, session: Session) -> Optional[Tracker]:
        """
        Fetch a specific tracker with detailed information.
        """
        tracker = session.get(Tracker, tracker_id)
        return tracker
    
    def get_tracker_holdings(self, tracker_id: int, session: Session) -> List[TrackerHolding]:
        """
        Fetch all holdings for a specific tracker.
        """
        statement = select(TrackerHolding).where(TrackerHolding.tracker_id == tracker_id)
        holdings = session.exec(statement).all()
        return list(holdings)


# Singleton instance
tracker_service = TrackerService()
