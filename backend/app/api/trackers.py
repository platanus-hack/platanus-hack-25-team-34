"""
Tracker API Routes
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.core.db import get_session
from app.services import tracker_service
from app.models import Tracker, TrackerHolding

router = APIRouter(prefix="/trackers", tags=["trackers"])


@router.get("/", response_model=List[Tracker])
def get_all_trackers(session: Session = Depends(get_session)):
    """
    Get all available trackers (Marketplace view).
    Public endpoint - no authentication required.
    """
    trackers = tracker_service.get_all_trackers(session)
    return trackers


@router.get("/{tracker_id}", response_model=Tracker)
def get_tracker_detail(tracker_id: int, session: Session = Depends(get_session)):
    """
    Get detailed information about a specific tracker.
    """
    tracker = tracker_service.get_tracker_by_id(tracker_id, session)
    if not tracker:
        raise HTTPException(status_code=404, detail="Tracker not found")
    return tracker


@router.get("/{tracker_id}/holdings", response_model=List[TrackerHolding])
def get_tracker_holdings(tracker_id: int, session: Session = Depends(get_session)):
    """
    Get the portfolio composition (holdings) for a specific tracker.
    """
    # First check if tracker exists
    tracker = tracker_service.get_tracker_by_id(tracker_id, session)
    if not tracker:
        raise HTTPException(status_code=404, detail="Tracker not found")

    holdings = tracker_service.get_tracker_holdings(tracker_id, session)
    return holdings
