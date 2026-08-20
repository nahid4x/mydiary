require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const sampleEntries = [
  {
    title: 'A quiet Sunday morning',
    content: `Woke up before the alarm today, which almost never happens. Made myself a proper coffee — not the rushed kind, but the slow pour-over kind that takes ten minutes and feels like a small ceremony.\n\nThe light coming through the kitchen window was that soft amber color it only gets in autumn. I sat with my mug and just... existed for a while. No phone, no plans. Just the sound of the neighborhood waking up slowly.\n\nI think I needed that more than I realized.`,
    mood: 'calm',
    weather: 'sunny',
    isFavorite: true,
    tags: ['reflection', 'mornings', 'self-care'],
  },
  {
    title: 'Presentation went better than expected',
    content: `Spent all of last week dreading today's presentation to the leadership team. Practiced it four times in front of my mirror, which felt absurd but actually helped.\n\nThe moment I started talking, something clicked. The nerves transformed into focus. I knew the material, I believed in it, and it showed. Got a round of applause at the end and two follow-up questions that led to a 20-minute discussion.\n\nMy manager pulled me aside afterward and said "that's the kind of work that gets noticed." I'm still glowing.`,
    mood: 'excited',
    weather: 'partly-cloudy',
    isFavorite: true,
    tags: ['work', 'achievement', 'growth'],
  },
  {
    title: 'Missing home a little',
    content: `Called my mom tonight. She talked for forty minutes about the garden, the neighbors, and a TV show I've never seen. I mostly just listened.\n\nThere's something about her voice that makes everything feel smaller and more manageable. I didn't realize how much I needed to hear it until we hung up and I sat in the quiet for a while.\n\nI should call more often. I always say that, and then life moves fast and weeks go by. Going to set a reminder for every Sunday evening.`,
    mood: 'sad',
    weather: 'rainy',
    tags: ['family', 'home', 'emotions'],
  },
  {
    title: 'Tried a new recipe',
    content: `Made shakshuka from scratch for the first time. It's been on my "to try" list for months.\n\nThe whole process was meditative — chopping onions, blooming the spices, watching the tomato sauce reduce. The kitchen smelled incredible.\n\nIt turned out better than any café version I've had. Simple food, made with attention, eaten slowly. There's something deeply satisfying about that.`,
    mood: 'happy',
    weather: 'cloudy',
    tags: ['cooking', 'food', 'home'],
  },
  {
    title: 'Rough day — needed to write',
    content: `Everything felt slightly off-kilter today. Like the universe shifted two degrees and I couldn't find my footing.\n\nNothing dramatically wrong. Just small things adding up — a meeting that ran long, a misunderstanding with a friend, forgetting to eat lunch, losing my keys for twenty minutes.\n\nSome days are just like that. I'm reminding myself that tomorrow is a clean page. That's the nice thing about days — they always end.`,
    mood: 'tired',
    tags: ['hard-days', 'reflection'],
  },
]

async function main() {
  console.log('🌱 Seeding database...')

  // Create demo user
  const hashedPassword = await bcrypt.hash('password123', 12)
  const user = await prisma.user.upsert({
    where: { email: 'demo@mydiary.app' },
    update: {},
    create: {
      name: 'Alex Rivera',
      email: 'demo@mydiary.app',
      password: hashedPassword,
      bio: 'Writing to remember. Remembering to grow.',
    },
  })

  console.log(`✅ Created user: ${user.email}`)

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mydiary.app' },
    update: { role: 'ADMIN' },
    create: {
      name: 'MyDiary Admin',
      email: 'admin@mydiary.app',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  console.log(`✅ Created admin: ${admin.email}`)

  // Create entries
  for (const entry of sampleEntries) {
    const { tags: tagNames, ...entryData } = entry

    // Upsert tags
    const tagRecords = await Promise.all(
      tagNames.map((name) =>
        prisma.tag.upsert({ where: { name }, update: {}, create: { name } })
      )
    )

    // Create diary entry
    const diary = await prisma.diary.create({
      data: {
        ...entryData,
        privacy: 'private',
        userId: user.id,
        entryDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        tags: {
          create: tagRecords.map((t) => ({ tagId: t.id })),
        },
      },
    })

    console.log(`📝 Created entry: "${diary.title}"`)
  }

  console.log('\n✨ Seed complete!')
  console.log('   Demo user  → demo@mydiary.app / password123')
  console.log('   Admin user → admin@mydiary.app / admin123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())