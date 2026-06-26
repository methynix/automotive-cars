import { AnalyticsService } from '../services/analytics.service.js';
import { success } from '../utils/apiResponse.js';

export const AnalyticsController = {
  async overview(req, res, next) {
    try { return success(res, await AnalyticsService.overview()); } catch (err) { next(err); }
  },
};
