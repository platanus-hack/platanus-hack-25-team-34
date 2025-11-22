/**
 * API Client for Hedgie Backend
 *
 * Centralizes all HTTP calls to the backend.
 * Base URL points to the FastAPI backend.
 */
import axios from "axios";

const apiClient = axios.create({
  baseURL: "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Auth API
export const authApi = {
  devLogin: async (userId: number) => {
    const response = await apiClient.post("auth/dev-login", {
      user_id: userId,
    });
    return response.data;
  },
};

// Tracker API
export const trackerApi = {
  getAllTrackers: async () => {
    const response = await apiClient.get("trackers/");
    return response.data;
  },

  getTrackerDetails: async (trackerId: number) => {
    const response = await apiClient.get(`trackers/${trackerId}`);
    return response.data;
  },

  getTrackerHoldings: async (trackerId: number) => {
    const response = await apiClient.get(`trackers/${trackerId}/holdings`);
    return response.data;
  },
};

// Investment API
export const investmentApi = {
  executeInvestment: async (
    userId: number,
    trackerId: number,
    amountClp: number
  ) => {
    const response = await apiClient.post("invest/", {
      user_id: userId,
      tracker_id: trackerId,
      amount_clp: amountClp,
    });
    return response.data;
  },
};

// Portfolio API
export const portfolioApi = {
  getUserPortfolio: async (userId: number) => {
    const response = await apiClient.get(`portfolio/${userId}`);
    return response.data;
  },
};

export const chartApi = {
  getChart: async () => {
    const response = await apiClient.post("chart/test", {
      val: 1,
    });
    return response.data;
  },
};

// User API
export const userApi = {
  deposit: async (userId: number, amountClp: number) => {
    const response = await apiClient.post(`user/${userId}/deposit`, {
      amount_clp: amountClp,
    });
    return response.data;
  },

  withdraw: async (userId: number, amountClp: number) => {
    const response = await apiClient.post(`user/${userId}/withdraw`, {
      amount_clp: amountClp,
    });
    return response.data;
  },

  getBalance: async (userId: number) => {
    const response = await apiClient.get(`user/${userId}/balance`);
    return response.data;
  },
};

export default apiClient;
