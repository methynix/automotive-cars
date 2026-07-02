import { AccountService } from '../services/account.service.js';
import { TestDriveService } from '../services/testdrive.service.js';
import { success } from '../utils/apiResponse.js';

export const AccountController = {
  // Saved cars
  async listSavedCars(req, res, next) {
    try { return success(res, await AccountService.listSavedCars(req.user.id)); } catch (err) { next(err); }
  },
  async addSavedCar(req, res, next) {
    try { return success(res, await AccountService.addSavedCar(req.user.id, req.body.review_id), 201); } catch (err) { next(err); }
  },
  async removeSavedCar(req, res, next) {
    try { return success(res, await AccountService.removeSavedCar(req.user.id, req.params.reviewId)); } catch (err) { next(err); }
  },

  // Preferences
  async getPreferences(req, res, next) {
    try { return success(res, await AccountService.getPreferences(req.user.id)); } catch (err) { next(err); }
  },
  async updatePreferences(req, res, next) {
    try { return success(res, await AccountService.upsertPreferences(req.user.id, req.body)); } catch (err) { next(err); }
  },

  // Inquiries
  async listInquiries(req, res, next) {
    try { return success(res, await AccountService.listInquiries(req.user.id)); } catch (err) { next(err); }
  },

  // My test drives
  async listTestDrives(req, res, next) {
    try { return success(res, await TestDriveService.getByProfile(req.user.id)); } catch (err) { next(err); }
  },
};
