/**
 * TypeScript type definitions that mirror backend API responses.
 * 
 * IMPORTANT: These types must match the JSON structure returned by the backend.
 * If backend models change, update these types accordingly.
 */

export interface User {
  id: number;
  name: string;
  balance_clp: number;
}

export interface Tracker {
  id: number;
  name: string;
  type: string; // 'fund' | 'politician'
  avatar_url?: string;
  description?: string;
  ytd_return: number;
  average_delay: number;
  risk_level: string; // 'low' | 'medium' | 'high'
  followers_count: number;
}

export interface TrackerHolding {
  id: number;
  tracker_id: number;
  ticker: string;
  company_name: string;
  allocation_percent: number;
}

export interface ActiveTracker {
  tracker_id: number;
  tracker_name: string;
  invested_amount_clp: number;
  current_value_clp: number;
  profit_loss_clp: number;
  profit_loss_percent: number;
}

export interface Portfolio {
  user_id: number;
  available_balance_clp: number;
  total_invested_clp: number;
  total_current_value_clp: number;
  total_profit_loss_clp: number;
  total_profit_loss_percent: number;
  active_trackers: ActiveTracker[];
}

export interface InvestmentResponse {
  success: boolean;
  message?: string;
  portfolio_item_id?: number;
  remaining_balance?: number;
  error?: string;
}
