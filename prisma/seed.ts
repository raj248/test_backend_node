import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean previous data for clean seed (dev only)
  await prisma.trash.deleteMany();
  await prisma.mCQ.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.testPaper.deleteMany();
  await prisma.course.deleteMany();

  // Create Courses
  const caInter = await prisma.course.create({
    data: {
      name: "CA Inter",
      courseType: "CAInter",
    },
  });

  const caFinal = await prisma.course.create({
    data: {
      name: "CA Final",
      courseType: "CAFinal",
    },
  });

  // Create Topics
  const accountingTopic = await prisma.topic.create({
    data: {
      name: "Accounting Basics",
      description: "Learn the fundamentals of accounting for CA Inter.",
      courseId: caInter.id,
    },
  });

  const auditingTopic = await prisma.topic.create({
    data: {
      name: "Auditing Principles",
      description: "Understand auditing standards for CA Final.",
      courseId: caFinal.id,
    },
  });

  // Create Test Papers
  const testPaper1 = await prisma.testPaper.create({
    data: {
      name: "Test Paper 1 - Riddles",
      topicId: accountingTopic.id,
    },
  });

  const testPaper2 = await prisma.testPaper.create({
    data: {
      name: "Test Paper 2 - Advanced Riddles",
      topicId: auditingTopic.id,
    },
  });

  // Create MCQs with riddles
  await prisma.mCQ.createMany({
    data: [
      {
        question: "I speak without a mouth and hear without ears. What am I?",
        options: {
          a: "An echo",
          b: "A shadow",
          c: "A dream",
          d: "A river",
        },
        correctAnswer: "a",
        topicId: accountingTopic.id,
        testPaperId: testPaper1.id,
      },
      {
        question: "What has keys but can’t open locks?",
        options: {
          a: "A map",
          b: "A piano",
          c: "A code",
          d: "A clock",
        },
        correctAnswer: "b",
        topicId: accountingTopic.id,
        testPaperId: testPaper1.id,
      },
      {
        question: "What comes once in a minute, twice in a moment, but never in a thousand years?",
        options: {
          a: "The letter M",
          b: "A breath",
          c: "A second",
          d: "A star",
        },
        correctAnswer: "a",
        topicId: auditingTopic.id,
        testPaperId: testPaper2.id,
      },
      {
        question: "I have branches, but no fruit, trunk or leaves. What am I?",
        options: {
          a: "A bank",
          b: "A library",
          c: "A river",
          d: "A mountain",
        },
        correctAnswer: "a",
        topicId: auditingTopic.id,
        testPaperId: testPaper2.id,
      },
    ],
  });

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
