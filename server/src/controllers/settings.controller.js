import { SettingsService } from '../services/settings.service.js';
import { success } from '../utils/apiResponse.js';

export const SettingsController = {
  async getSettings(req, res, next) {
    try {
      return success(res, await SettingsService.getSettings());
    } catch (err) { next(err); }
  },

  async updateSettings(req, res, next) {
    try {
      return success(res, await SettingsService.updateSettings(req.body));
    } catch (err) { next(err); }
  }
};
