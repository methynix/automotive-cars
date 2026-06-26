import express from 'express';
import { ReviewService } from '../services/review.service.js';

const router = express.Router();

/**
 * @openapi
 * /sitemap.xml:
 *   get:
 *     tags: [System]
 *     summary: Generate sitemap XML
 *     responses:
 *       200:
 *         description: Sitemap XML
 *         content:
 *           application/xml:
 *             schema:
 *               type: string
 */
router.get('/sitemap.xml', async (req, res) => {
  try {
    const reviews = await ReviewService.getAllForSitemap();
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    for (const review of reviews) {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/api/reviews/${review.slug}</loc>\n`;
      if (review.updated_at) {
        xml += `    <lastmod>${new Date(review.updated_at).toISOString()}</lastmod>\n`;
      }
      xml += '  </url>\n';
    }

    xml += '</urlset>';
    res.set('Content-Type', 'application/xml');
    return res.send(xml);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to generate sitemap' });
  }
});

export default router;
