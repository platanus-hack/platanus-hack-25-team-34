"""
Transaction Service

Handles transaction history and records.
"""
from typing import List, Dict
from sqlmodel import Session, select
from app.models import Transaction, Tracker


class TransactionService:
    """
    Service for managing transaction history.
    """
    
    def get_user_transactions(
        self, 
        user_id: int, 
        session: Session,
        limit: int = None
    ) -> List[Dict]:
        """
        Get transaction history for a user.
        
        Args:
            user_id: ID of the user
            session: Database session
            limit: Optional limit on number of transactions (None = all)
            
        Returns:
            List of transaction dictionaries with tracker names
        """
        # Query transactions with tracker info
        statement = select(Transaction, Tracker).join(
            Tracker, Transaction.tracker_id == Tracker.id
        ).where(
            Transaction.user_id == user_id
        ).order_by(Transaction.timestamp.desc())
        
        if limit:
            statement = statement.limit(limit)
        
        results = session.exec(statement).all()
        
        transactions = []
        for transaction, tracker in results:
            transactions.append({
                "id": transaction.id,
                "type": transaction.type,
                "tracker_id": transaction.tracker_id,
                "tracker_name": tracker.name,
                "amount_clp": transaction.amount_clp,
                "timestamp": transaction.timestamp.isoformat()
            })
        
        return transactions


# Singleton instance
transaction_service = TransactionService()
