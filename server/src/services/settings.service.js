import prisma from '../config/prisma.js';

// Baseline site content. Anything an admin hasn't overridden in the DB falls
// back to these, so the public site (hero, contact details, socials) always
// renders real values and the admin form is always pre-filled — never blank.
export const DEFAULT_SETTINGS = {
  hero_title: 'FUTURE AUTOMOTIVE',
  hero_subtitle: 'Where technical precision meets elite automotive journalism. Explore the engineering, the icons, and the future of high-performance electric machines.',
  contact_email: 'hello@futureauto.co.tz',
  contact_phone: '+255 700 000 000',
  contact_address: 'Masaki, Dar es Salaam',
  whatsapp: '255689759215',
  instagram_url: 'https://instagram.com',
  twitter_url: 'https://twitter.com',
  seo_title: 'Future Automotive — The Modern Car Marketplace',
  seo_description: 'Discover, compare and enquire about the latest vehicles. Editorial reviews, specs and test drives.',
};

export const SettingsService = {
  async getSettings() {
    const records = await prisma.setting.findMany();
    // Start from defaults so missing keys are always populated; DB rows override.
    const settings = { ...DEFAULT_SETTINGS };
    for (const r of records) {
      settings[r.key] = r.value;
    }
    return settings;
  },

  async updateSettings(data) {
    const transactions = Object.entries(data).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value }
      })
    );
    await prisma.$transaction(transactions);
    return this.getSettings();
  }
};
