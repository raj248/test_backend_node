import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean previous data for clean seed (dev only)
  await prisma.trash.deleteMany();
  await prisma.mCQ.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.course.deleteMany();

  // Seed Courses
  const caInter = await prisma.course.create({
    data: {
      name: 'CA Inter',
      courseType: 'CAInter',
    },
  });

  const caFinal = await prisma.course.create({
    data: {
      name: 'CA Final',
      courseType: 'CAFinal',
    },
  });

  // Topics per course
  const caInterTopics = await prisma.topic.createMany({
    data: [
      { name: 'Accounting Basics', description: 'Introduction to accounting', courseId: caInter.id },
      { name: 'Corporate Law', description: 'Corporate compliance and law', courseId: caInter.id },
      { name: 'Taxation', description: 'Basics of direct and indirect taxes', courseId: caInter.id },
    ],
  });

  const caFinalTopics = await prisma.topic.createMany({
    data: [
      { name: 'Strategic Financial Management', description: 'Advanced financial strategies', courseId: caFinal.id },
      { name: 'Advanced Auditing', description: 'Deep dive into auditing standards', courseId: caFinal.id },
      { name: 'Direct Tax Laws', description: 'Advanced tax laws and planning', courseId: caFinal.id },
    ],
  });

  // Fetch topics to get their IDs for MCQ linking
  const topics = await prisma.topic.findMany();

  // Sample riddles for MCQs
  const riddles = [
    {
      question: "I speak without a mouth and hear without ears. I have nobody, but I come alive with wind. What am I?",
      options: { a: "Echo", b: "Cloud", c: "Whistle", d: "Windmill" },
      correctAnswer: "a",
    },
    {
      question: "What can fill a room but takes up no space?",
      options: { a: "Water", b: "Light", c: "Air", d: "Sound" },
      correctAnswer: "b",
    },
    {
      question: "I have keys but no locks. I have space but no rooms. You can enter but can’t go outside. What am I?",
      options: { a: "Keyboard", b: "Map", c: "Puzzle", d: "Book" },
      correctAnswer: "a",
    },
    {
      question: "What gets wetter the more it dries?",
      options: { a: "Towel", b: "Sun", c: "Rain", d: "Cloud" },
      correctAnswer: "a",
    },
    {
      question: "The more of this there is, the less you see. What is it?",
      options: { a: "Water", b: "Darkness", c: "Fog", d: "Light" },
      correctAnswer: "b",
    },
  ];

  // Add MCQs under each topic
  for (const topic of topics) {
    for (let i = 0; i < 5; i++) {
      const riddle = riddles[i % riddles.length];
      await prisma.mCQ.create({
        data: {
          question: riddle.question,
          options: riddle.options,
          correctAnswer: riddle.correctAnswer,
          testPaperNumber: 1,
          topicId: topic.id,
        },
      });
    }
  }

  console.log('✅ Seeding completed.');
}

main()
  .catch(e => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
