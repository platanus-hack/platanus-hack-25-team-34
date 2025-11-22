/**
 * API Client Tests
 * 
 * Tests the API service layer to ensure:
 * - Correct endpoint paths (no trailing slashes)
 * - Proper request formatting
 * - Correct HTTP methods
 * - Request/response handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { authApi, trackerApi, investmentApi, portfolioApi, chartApi } from '../services/api';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

describe('API Client', () => {
  beforeEach(() => {
    // Setup axios mock
    mockedAxios.create.mockReturnValue({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      defaults: {},
      interceptors: {
        request: { use: vi.fn(), eject: vi.fn() },
        response: { use: vi.fn(), eject: vi.fn() },
      },
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Configuration', () => {
    it('should create axios instance with correct base URL', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: '/api/v1',
        })
      );
    });

    it('should set Content-Type header to application/json', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    });
  });

  describe('Auth API', () => {
    it('should call dev login with correct path (no trailing slash)', async () => {
      const mockPost = vi.fn().mockResolvedValue({ data: { id: 1, name: 'User' } });
      mockedAxios.create.mockReturnValue({
        post: mockPost,
      } as any);

      await authApi.devLogin(1);

      expect(mockPost).toHaveBeenCalledWith('auth/dev-login', { user_id: 1 });
      expect(mockPost).not.toHaveBeenCalledWith('auth/dev-login/', expect.anything());
    });

    it('should send user_id in request body', async () => {
      const mockPost = vi.fn().mockResolvedValue({ data: {} });
      mockedAxios.create.mockReturnValue({
        post: mockPost,
      } as any);

      await authApi.devLogin(42);

      expect(mockPost).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ user_id: 42 })
      );
    });
  });

  describe('Tracker API', () => {
    it('should call get all trackers with correct path and trailing slash', async () => {
      const mockGet = vi.fn().mockResolvedValue({ data: [] });
      mockedAxios.create.mockReturnValue({
        get: mockGet,
      } as any);

      await trackerApi.getAllTrackers();

      expect(mockGet).toHaveBeenCalledWith('trackers/');
    });

    it('should call get tracker details WITHOUT trailing slash', async () => {
      const mockGet = vi.fn().mockResolvedValue({ data: {} });
      mockedAxios.create.mockReturnValue({
        get: mockGet,
      } as any);

      await trackerApi.getTrackerDetails(1);

      expect(mockGet).toHaveBeenCalledWith('trackers/1');
      expect(mockGet).not.toHaveBeenCalledWith('trackers/1/');
    });

    it('should call get tracker holdings WITHOUT trailing slash', async () => {
      const mockGet = vi.fn().mockResolvedValue({ data: [] });
      mockedAxios.create.mockReturnValue({
        get: mockGet,
      } as any);

      await trackerApi.getTrackerHoldings(1);

      expect(mockGet).toHaveBeenCalledWith('trackers/1/holdings');
      expect(mockGet).not.toHaveBeenCalledWith('trackers/1/holdings/');
    });

    it('should use correct tracker ID in path', async () => {
      const mockGet = vi.fn().mockResolvedValue({ data: {} });
      mockedAxios.create.mockReturnValue({
        get: mockGet,
      } as any);

      await trackerApi.getTrackerDetails(99);

      expect(mockGet).toHaveBeenCalledWith('trackers/99');
    });
  });

  describe('Investment API', () => {
    it('should call invest endpoint with correct path and trailing slash', async () => {
      const mockPost = vi.fn().mockResolvedValue({ data: { success: true } });
      mockedAxios.create.mockReturnValue({
        post: mockPost,
      } as any);

      await investmentApi.executeInvestment(1, 2, 50000);

      expect(mockPost).toHaveBeenCalledWith('invest/', expect.anything());
    });

    it('should send all required fields in request body', async () => {
      const mockPost = vi.fn().mockResolvedValue({ data: { success: true } });
      mockedAxios.create.mockReturnValue({
        post: mockPost,
      } as any);

      await investmentApi.executeInvestment(1, 2, 50000);

      expect(mockPost).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          user_id: 1,
          tracker_id: 2,
          amount_clp: 50000,
        })
      );
    });

    it('should use correct field names (snake_case)', async () => {
      const mockPost = vi.fn().mockResolvedValue({ data: { success: true } });
      mockedAxios.create.mockReturnValue({
        post: mockPost,
      } as any);

      await investmentApi.executeInvestment(3, 4, 100000);

      const callArgs = mockPost.mock.calls[0][1];
      expect(callArgs).toHaveProperty('user_id');
      expect(callArgs).toHaveProperty('tracker_id');
      expect(callArgs).toHaveProperty('amount_clp');
      expect(callArgs).not.toHaveProperty('userId');
      expect(callArgs).not.toHaveProperty('trackerId');
      expect(callArgs).not.toHaveProperty('amountClp');
    });
  });

  describe('Portfolio API - Critical Path Tests', () => {
    it('should call portfolio endpoint WITHOUT trailing slash', async () => {
      const mockGet = vi.fn().mockResolvedValue({ 
        data: { 
          user_id: 1, 
          active_trackers: [] 
        } 
      });
      mockedAxios.create.mockReturnValue({
        get: mockGet,
      } as any);

      await portfolioApi.getUserPortfolio(1);

      // This is the critical test - no trailing slash
      expect(mockGet).toHaveBeenCalledWith('portfolio/1');
      expect(mockGet).not.toHaveBeenCalledWith('portfolio/1/');
    });

    it('should use correct user ID in path', async () => {
      const mockGet = vi.fn().mockResolvedValue({ 
        data: { 
          user_id: 42, 
          active_trackers: [] 
        } 
      });
      mockedAxios.create.mockReturnValue({
        get: mockGet,
      } as any);

      await portfolioApi.getUserPortfolio(42);

      expect(mockGet).toHaveBeenCalledWith('portfolio/42');
    });

    it('should return portfolio data from response', async () => {
      const mockPortfolio = {
        user_id: 1,
        available_balance_clp: 1000000,
        total_invested_clp: 50000,
        active_trackers: [],
      };

      const mockGet = vi.fn().mockResolvedValue({ data: mockPortfolio });
      mockedAxios.create.mockReturnValue({
        get: mockGet,
      } as any);

      const result = await portfolioApi.getUserPortfolio(1);

      expect(result).toEqual(mockPortfolio);
    });
  });

  describe('Chart API', () => {
    it('should call chart test endpoint without trailing slash', async () => {
      const mockPost = vi.fn().mockResolvedValue({ data: { spec: {} } });
      mockedAxios.create.mockReturnValue({
        post: mockPost,
      } as any);

      await chartApi.getChart();

      expect(mockPost).toHaveBeenCalledWith('chart/test', expect.anything());
      expect(mockPost).not.toHaveBeenCalledWith('chart/test/', expect.anything());
    });
  });

  describe('URL Path Consistency', () => {
    it('should never add double slashes in constructed URLs', async () => {
      const mockGet = vi.fn().mockResolvedValue({ data: {} });
      mockedAxios.create.mockReturnValue({
        get: mockGet,
      } as any);

      await trackerApi.getTrackerDetails(1);

      const calledPath = mockGet.mock.calls[0][0];
      expect(calledPath).not.toMatch(/\/\//); // No double slashes
    });

    it('should construct portfolio path correctly for different user IDs', async () => {
      const mockGet = vi.fn().mockResolvedValue({ data: {} });
      mockedAxios.create.mockReturnValue({
        get: mockGet,
      } as any);

      const userIds = [1, 2, 3, 100, 999];

      for (const userId of userIds) {
        mockGet.mockClear();
        await portfolioApi.getUserPortfolio(userId);
        expect(mockGet).toHaveBeenCalledWith(`portfolio/${userId}`);
      }
    });
  });

  describe('Error Handling', () => {
    it('should propagate API errors', async () => {
      const mockError = new Error('Network Error');
      const mockGet = vi.fn().mockRejectedValue(mockError);
      mockedAxios.create.mockReturnValue({
        get: mockGet,
      } as any);

      await expect(portfolioApi.getUserPortfolio(1)).rejects.toThrow('Network Error');
    });

    it('should handle 404 errors on portfolio endpoint', async () => {
      const mockError = {
        response: {
          status: 404,
          data: { detail: 'User not found' },
        },
      };
      const mockGet = vi.fn().mockRejectedValue(mockError);
      mockedAxios.create.mockReturnValue({
        get: mockGet,
      } as any);

      await expect(portfolioApi.getUserPortfolio(999)).rejects.toEqual(mockError);
    });
  });

  describe('Response Data Extraction', () => {
    it('should extract data from axios response for all endpoints', async () => {
      const testData = { test: 'data' };
      const mockGet = vi.fn().mockResolvedValue({ 
        data: testData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      });
      mockedAxios.create.mockReturnValue({
        get: mockGet,
      } as any);

      const result = await trackerApi.getAllTrackers();

      expect(result).toEqual(testData);
      expect(result).not.toHaveProperty('status');
      expect(result).not.toHaveProperty('headers');
    });
  });
});
