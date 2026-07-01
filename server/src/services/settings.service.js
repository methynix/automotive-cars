import prisma from '../config/prisma.js';

export const SettingsService = {
  async getSettings() {
    const records = await prisma.setting.findMany();
    const settings = {};
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
