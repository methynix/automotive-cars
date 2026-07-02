import prisma from '../config/prisma.js';

// Everything a logged-in customer manages about their own account.
// The caller always passes the authenticated profileId (from req.user.id) —
// never a client-supplied id — so rows can only ever be read/written for self.

const reviewSummary = {
  select: {
    id: true, slug: true, title: true, manufacturer: true, model: true,
    year: true, featured_image: true, body_style: true,
    specs: { select: { price: true, fuel_type: true } },
  },
};

export const AccountService = {
  /* ── Virtual Garage (saved cars) ── */
  async listSavedCars(profileId) {
    const rows = await prisma.savedCar.findMany({
      where: { profile_id: profileId },
      orderBy: { created_at: 'desc' },
      include: { review: reviewSummary },
    });
    // Skip any saved rows whose review was hard-deleted just in case.
    return rows.filter((r) => r.review);
  },

  async addSavedCar(profileId, reviewId) {
    const review = await prisma.review.findFirst({ where: { id: reviewId, deleted_at: null } });
    if (!review) throw Object.assign(new Error('Vehicle not found'), { status: 404 });
    // Idempotent: saving an already-saved car is a no-op that still succeeds.
    return prisma.savedCar.upsert({
      where: { profile_id_review_id: { profile_id: profileId, review_id: reviewId } },
      create: { profile_id: profileId, review_id: reviewId },
      update: {},
      include: { review: reviewSummary },
    });
  },

  async removeSavedCar(profileId, reviewId) {
    await prisma.savedCar.deleteMany({ where: { profile_id: profileId, review_id: reviewId } });
    return { review_id: reviewId };
  },

  /* ── Preference Center ── */
  async getPreferences(profileId) {
    const pref = await prisma.userPreference.findUnique({ where: { profile_id: profileId } });
    return pref || {
      profile_id: profileId, body_styles: [], budget_min: null, budget_max: null,
      fuel_types: [], notify_on_match: false,
    };
  },

  async upsertPreferences(profileId, data) {
    const payload = {
      body_styles: data.body_styles ?? [],
      budget_min: data.budget_min ?? null,
      budget_max: data.budget_max ?? null,
      fuel_types: data.fuel_types ?? [],
      notify_on_match: data.notify_on_match ?? false,
    };
    return prisma.userPreference.upsert({
      where: { profile_id: profileId },
      create: { profile_id: profileId, ...payload },
      update: payload,
    });
  },

  /* ── My Inquiries (leads the customer submitted) ── */
  async listInquiries(profileId) {
    return prisma.lead.findMany({
      where: { profile_id: profileId },
      orderBy: { created_at: 'desc' },
      include: { review: { select: { title: true, slug: true, manufacturer: true, model: true } } },
    });
  },
};
