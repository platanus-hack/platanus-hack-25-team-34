/**
 * Application-wide constants
 */

/**
 * CLP to USD exchange rate (mock value for MVP)
 * Update this value to match real-world exchange rates
 */
export const CLP_TO_USD_RATE = 950;

/**
 * Convert CLP to USD
 */
export const convertClpToUsd = (clp: number): number => {
  return clp / CLP_TO_USD_RATE;
};

/**
 * Convert USD to CLP
 */
export const convertUsdToClp = (usd: number): number => {
  return usd * CLP_TO_USD_RATE;
};

/**
 * Format currency in CLP
 */
export const formatCLP = (amount: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format currency in USD
 */
export const formatUSD = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};
