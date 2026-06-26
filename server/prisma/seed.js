import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import 'dotenv/config'

const prisma = new PrismaClient()

// Admin credentials come from the environment — never hardcoded.
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@futureauto.com'
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD

const brands = [
  { name: 'BYD', country: 'China', founded_year: 1995, description: "Build Your Dreams — the world's largest EV maker by volume." },
  { name: 'NIO', country: 'China', founded_year: 2014, description: 'Premium EV maker known for its battery-swap network.' },
  { name: 'XPeng', country: 'China', founded_year: 2014, description: 'Tech-forward EV brand with advanced driver assistance.' },
  { name: 'Li Auto', country: 'China', founded_year: 2015, description: 'Specialist in extended-range electric family SUVs.' },
  { name: 'Zeekr', country: 'China', founded_year: 2021, description: "Geely's premium performance EV brand." },
]

// A small catalog that exercises every new field (body_style / condition / mileage)
// so the listings filters and compare page have real data to work with.
const reviews = [
  {
    title: '2024 BYD Seal Performance Review', slug: 'byd-seal-2024',
    manufacturer: 'BYD', model: 'Seal', year: 2024, body_style: 'Sedan', condition: 'new',
    excerpt: 'The electric sedan that challenges the status quo.', rating: 8.6, status: 'published', featured: true,
    content: { body: 'A genuinely well-sorted electric sedan with sharp handling and a premium cabin for the money.', pros: ['Strong value', 'Refined ride', 'Quick charging'], cons: ['Infotainment learning curve'] },
    specs: { engine: 'Dual Motor', horsepower: 523, torque: 670, drivetrain: 'All-Wheel Drive', fuel_type: 'Electric', acceleration: '3.8', top_speed: '111', seating: 5, mileage: 25, price: 45000 },
  },
  {
    title: '2024 NIO ET7 Review', slug: 'nio-et7-2024',
    manufacturer: 'NIO', model: 'ET7', year: 2024, body_style: 'Sedan', condition: 'new',
    excerpt: 'A luxury flagship built around battery swapping.', rating: 8.4, status: 'published', featured: true,
    content: { body: 'The ET7 pairs limousine comfort with NIO\'s swap network, sidestepping charge-time anxiety.', pros: ['Battery swap', 'Plush interior', 'Long range'], cons: ['Pricey', 'Heavy'] },
    specs: { engine: 'Dual Motor', horsepower: 644, torque: 850, drivetrain: 'All-Wheel Drive', fuel_type: 'Electric', acceleration: '3.8', top_speed: '124', seating: 5, mileage: 40, price: 69000 },
  },
  {
    title: '2024 XPeng G9 Review', slug: 'xpeng-g9-2024',
    manufacturer: 'XPeng', model: 'G9', year: 2024, body_style: 'SUV', condition: 'new',
    excerpt: 'A fast-charging family SUV with serious tech.', rating: 8.2, status: 'published', featured: false,
    content: { body: 'One of the quickest-charging SUVs on sale, with a calm, spacious cabin.', pros: ['800V charging', 'Roomy', 'Quiet'], cons: ['Firm low-speed ride'] },
    specs: { engine: 'Dual Motor', horsepower: 551, torque: 717, drivetrain: 'All-Wheel Drive', fuel_type: 'Electric', acceleration: '4.9', top_speed: '124', seating: 5, mileage: 18, price: 47000 },
  },
  {
    title: '2024 Zeekr 001 Review', slug: 'zeekr-001-2024',
    manufacturer: 'Zeekr', model: '001', year: 2024, body_style: 'Wagon', condition: 'used',
    excerpt: 'A shooting-brake EV that blends speed and space.', rating: 8.5, status: 'published', featured: false,
    content: { body: 'Striking shooting-brake looks, big performance and a surprisingly practical boot.', pros: ['Fast', 'Distinctive', 'Practical'], cons: ['Options add up'] },
    specs: { engine: 'Dual Motor', horsepower: 536, torque: 686, drivetrain: 'All-Wheel Drive', fuel_type: 'Electric', acceleration: '3.8', top_speed: '124', seating: 5, mileage: 12400, price: 38000 },
  },
  {
    title: '2024 Li Auto L9 Review', slug: 'li-auto-l9-2024',
    manufacturer: 'Li Auto', model: 'L9', year: 2024, body_style: 'SUV', condition: 'certified',
    excerpt: 'A six-seat EREV SUV built for long family trips.', rating: 8.3, status: 'published', featured: false,
    content: { body: 'Extended-range setup kills range anxiety; the cabin is a lounge on wheels.', pros: ['No range anxiety', 'Six seats', 'Comfortable'], cons: ['Large footprint'] },
    specs: { engine: 'EREV', horsepower: 449, torque: 620, drivetrain: 'All-Wheel Drive', fuel_type: 'Hybrid', acceleration: '5.3', top_speed: '112', seating: 6, mileage: 8200, price: 55000 },
  },
]

async function main() {
  if (!ADMIN_PASSWORD) {
    throw new Error('SEED_ADMIN_PASSWORD is not set in .env — refusing to seed with a default password.')
  }

  const password_hash = await bcrypt.hash(ADMIN_PASSWORD, 10)

  // Upsert admin so re-running the seed never crashes on a duplicate email,
  // and an existing admin's password is reset to the .env value.
  const admin = await prisma.profile.upsert({
    where: { email: ADMIN_EMAIL },
    update: { password_hash, role: 'admin', status: 'active' },
    create: { email: ADMIN_EMAIL, password_hash, full_name: 'Site Admin', role: 'admin', status: 'active' },
  })

  // Reset the catalog (safe to re-run). Deleting reviews cascades to specs,
  // gallery and comments; leads keep their row with review_id set to null.
  await prisma.review.deleteMany()
  await prisma.brand.deleteMany()

  for (const b of brands) await prisma.brand.create({ data: b })

  for (const r of reviews) {
    const { specs, gallery, ...rest } = r
    await prisma.review.create({
      data: {
        ...rest,
        published_at: rest.status === 'published' ? new Date() : null,
        created_by: admin.id,
        specs: specs ? { create: specs } : undefined,
        gallery: gallery && gallery.length ? { create: gallery } : undefined,
      },
    })
  }

  console.log(`🌱 Seeded admin (${ADMIN_EMAIL}), ${brands.length} brands, ${reviews.length} reviews.`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })