import prisma from '../config/prisma.js';
import { slugify } from '../utils/slugify.js';

const reviewInclude = {
  specs: true,
  gallery: { orderBy: { sort_order: 'asc' } },
};

// specs is now a one-to-one relation, so it is already a single object (or null).
function formatReview(review) {
  if (!review) return null;
  const { gallery, ...rest } = review;
  return { ...rest, gallery: gallery || [] };
}

// Map a sort key (from the client) to a Prisma orderBy.
function buildOrderBy(sort) {
  switch (sort) {
    case 'oldest': return { published_at: 'asc' };
    case 'price-asc': return { specs: { price: 'asc' } };
    case 'price-desc': return { specs: { price: 'desc' } };
    case 'rating-desc': return { rating: 'desc' };
    case 'year-desc': return { year: 'desc' };
    case 'mileage-asc': return { specs: { mileage: 'asc' } };
    case 'views-desc': return { views: 'desc' };
    case 'newest':
    default: return { published_at: 'desc' };
  }
}

// Build the shared WHERE clause for public/catalog queries.
function buildPublicWhere(f = {}) {
  const { search, manufacturer, bodyStyle, condition, drivetrain,
    minYear, maxYear, minRating, minPrice, maxPrice, minMileage, maxMileage, featured } = f;

  const priceFilter = {};
  if (minPrice != null && minPrice !== '') priceFilter.gte = parseFloat(minPrice);
  if (maxPrice != null && maxPrice !== '') priceFilter.lte = parseFloat(maxPrice);

  const mileageFilter = {};
  if (minMileage != null && minMileage !== '') mileageFilter.gte = parseInt(minMileage);
  if (maxMileage != null && maxMileage !== '') mileageFilter.lte = parseInt(maxMileage);

  const specs = {};
  if (Object.keys(priceFilter).length) specs.price = priceFilter;
  if (Object.keys(mileageFilter).length) specs.mileage = mileageFilter;
  if (drivetrain) specs.drivetrain = { contains: drivetrain, mode: 'insensitive' };

  return {
    status: 'published',
    deleted_at: null,
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { manufacturer: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(manufacturer && { manufacturer: { equals: manufacturer, mode: 'insensitive' } }),
    ...(bodyStyle && { body_style: { equals: bodyStyle, mode: 'insensitive' } }),
    ...(condition && { condition }),
    ...(minYear && { year: { gte: parseInt(minYear) } }),
    ...(maxYear && { year: { lte: parseInt(maxYear) } }),
    ...(minRating && { rating: { gte: parseFloat(minRating) } }),
    ...(featured === 'true' || featured === true ? { featured: true } : {}),
    ...(Object.keys(specs).length ? { specs } : {}),
  };
}

export const ReviewService = {
  async createReview(payload) {
    const { specs, gallery, ...reviewData } = payload;
    const slugBase = payload.slug || slugify(payload.title || `${payload.manufacturer}-${payload.model}`);
    const slug = `${slugBase}-${Date.now().toString(36)}`;

    if (reviewData.status === 'published' && !reviewData.published_at) {
      reviewData.published_at = new Date();
    }

    const data = await prisma.review.create({
      data: {
        ...reviewData,
        slug,
        specs: specs ? { create: specs } : undefined,
        gallery: gallery && gallery.length ? { create: gallery } : undefined,
      },
      include: reviewInclude,
    });
    return formatReview(data);
  },

  async updateReview(id, payload) {
    const { specs, gallery, ...reviewData } = payload;

    if (reviewData.status === 'published' && reviewData.published_at === undefined) {
      const current = await prisma.review.findUnique({ where: { id }, select: { published_at: true } });
      if (current && !current.published_at) reviewData.published_at = new Date();
    }

    const data = await prisma.$transaction(async (tx) => {
      if (specs !== undefined) {
        // 1:1 spec -> upsert
        await tx.reviewSpec.upsert({
          where: { review_id: id },
          create: { ...specs, review_id: id },
          update: { ...specs },
        });
      }
      if (gallery !== undefined) {
        await tx.reviewGallery.deleteMany({ where: { review_id: id } });
        if (gallery.length > 0) {
          await tx.reviewGallery.createMany({ data: gallery.map((g) => ({ ...g, review_id: id })) });
        }
      }
      return tx.review.update({
        where: { id },
        data: { ...reviewData, updated_at: new Date() },
        include: reviewInclude,
      });
    });
    return formatReview(data);
  },

  async setPublishStatus(id, status) {
    const data = await prisma.review.update({
      where: { id },
      data: {
        status,
        updated_at: new Date(),
        ...(status === 'published' ? { published_at: new Date() } : {}),
      },
      include: reviewInclude,
    });
    return formatReview(data);
  },

  async softDeleteReview(id) {
    const data = await prisma.review.update({
      where: { id },
      data: { deleted_at: new Date(), updated_at: new Date() },
      include: reviewInclude,
    });
    return formatReview(data);
  },

  async restoreReview(id) {
    const data = await prisma.review.update({
      where: { id },
      data: { deleted_at: null, updated_at: new Date() },
      include: reviewInclude,
    });
    return formatReview(data);
  },

  async getPublishedReviews({ page = 1, limit = 10, sort, ...filters } = {}) {
    const skip = (page - 1) * limit;
    const where = buildPublicWhere({ ...filters });
    const [data, total] = await Promise.all([
      prisma.review.findMany({ where, orderBy: buildOrderBy(sort), skip, take: limit, include: reviewInclude }),
      prisma.review.count({ where }),
    ]);
    return { data: data.map(formatReview), total, page, limit };
  },

  async getReviewBySlug(slug) {
    const data = await prisma.review.findFirst({
      where: { slug, status: 'published', deleted_at: null },
      include: reviewInclude,
    });
    if (data) {
      await prisma.review.update({ where: { id: data.id }, data: { views: { increment: 1 } } });
    }
    return formatReview(data);
  },

  async getFeaturedReviews({ page = 1, limit = 10 } = {}) {
    const skip = (page - 1) * limit;
    const where = { status: 'published', featured: true, deleted_at: null };
    const [data, total] = await Promise.all([
      prisma.review.findMany({ where, orderBy: { published_at: 'desc' }, skip, take: limit, include: reviewInclude }),
      prisma.review.count({ where }),
    ]);
    return { data: data.map(formatReview), total, page, limit };
  },

  async adminGetAll({ page = 1, limit = 20, status, search, includeDeleted } = {}) {
    const skip = (page - 1) * limit;
    const where = {
      ...(!includeDeleted && { deleted_at: null }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { manufacturer: { contains: search, mode: 'insensitive' } },
          { model: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };
    const [data, total] = await Promise.all([
      prisma.review.findMany({ where, orderBy: { created_at: 'desc' }, skip, take: limit, include: reviewInclude }),
      prisma.review.count({ where }),
    ]);
    return { data: data.map(formatReview), total, page, limit };
  },

  async getAllForSitemap() {
    return prisma.review.findMany({
      where: { status: 'published', deleted_at: null },
      select: { slug: true, updated_at: true },
      orderBy: { published_at: 'desc' },
    });
  },
};
