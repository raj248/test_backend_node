import { PrismaClient } from "@prisma/client";
import { coursesData, topicsData, testPaperData, mcqSamples } from "./seed-data";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  await prisma.trash.deleteMany();
  await prisma.mCQ.deleteMany();
  await prisma.testPaper.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.course.deleteMany();

  // Seed Courses
  const courses = await Promise.all(
    coursesData.map((course) => prisma.course.create({ data: course }))
  );

  const courseMap = Object.fromEntries(courses.map((c) => [c.name, c.id]));

  // Seed Topics
  const topics = await Promise.all(
    topicsData(courseMap).map((topic) => prisma.topic.create({ data: topic }))
  );

  // Seed Test Papers
  const testPapers: any[] = [];
  for (const topic of topics) {
    const papers = await Promise.all(
      testPaperData(topic.id, topic.name).map((paper) =>
        prisma.testPaper.create({ data: paper })
      )
    );
    testPapers.push(...papers);
  }

  // Seed MCQs
  for (const paper of testPapers) {
    for (const mcq of mcqSamples) {
      await prisma.mCQ.create({
        data: {
          question: mcq.question,
          options: mcq.options,
          correctAnswer: mcq.correctAnswer,
          topic: { connect: { id: paper.topicId } },
          testPaper: { connect: { id: paper.id } },
          marks: mcq.marks,
          explanation: mcq.explanation,
        },
      });
    }
  }

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
