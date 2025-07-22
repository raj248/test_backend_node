import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const TestPaperModel = {
  async getAll() {
    try {
      const testPapers = await prisma.testPaper.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "asc" },
        include: { topic: true },
      });
      return { success: true, data: testPapers };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Failed to fetch all Test Papers." };
    }
  },

  async getById(testPaperId: string) {
    if (!testPaperId) return { success: false, error: "Test Paper ID is required." };
    try {
      const testPaper = await prisma.testPaper.findUnique({
        where: { id: testPaperId },
        include: {
          mcqs: {
            where: { deletedAt: null },
            orderBy: { createdAt: "asc" },
          },
          topic: {
            include: {
              course: true,
            },
          },
        },
      });

      if (!testPaper) return { success: false, error: "Test Paper not found." };

      // Calculate total marks from MCQs
      const totalMarks = testPaper.mcqs.reduce((sum, mcq) => {
        return sum + (mcq.marks ?? 0);
      }, 0);

      return {
        success: true,
        data: {
          ...testPaper,
          totalMarks, // attach computed totalMarks here
        },
      };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Failed to fetch Test Paper." };
    }
  },

  async findByTopicId(topicId: string) {
    if (!topicId) return { success: false, error: "Topic ID is required." };
    try {
      const testPapers = await prisma.testPaper.findMany({
        where: {
          topicId,
          deletedAt: null,
        },
        include: {
          mcqs: {
            where: { deletedAt: null },
            select: { id: true }, // lightweight
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });
      return { success: true, data: testPapers };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Failed to fetch Test Papers by Topic ID." };
    }
  },

  async getForTest(testPaperId: string) {
    if (!testPaperId) return { success: false, error: "Test Paper ID is required." };
    try {
      const testPaper = await prisma.testPaper.findUnique({
        where: { id: testPaperId, deletedAt: null },
        select: {
          id: true,
          name: true,
          description: true,
          timeLimitMinutes: true,
          topicId: true,
          createdAt: true,
          updatedAt: true,
          mcqs: {
            where: { deletedAt: null },
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              question: true,
              options: true,
              marks: true,
            },
          },
        },
      });

      if (!testPaper) {
        return { success: false, error: "Test Paper not found." };
      }

      const totalMarks = testPaper.mcqs.reduce((sum, mcq) => {
        return sum + (mcq.marks ?? 0);
      }, 0);

      return {
        success: true,
        data: {
          ...testPaper,
          totalMarks, // attach computed totalMarks here
        }
      };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Failed to fetch test paper and MCQs." };
    }
  },

  async getTestPaperAnswersAndExplanations(testPaperId: string) {
    try {
      const testPaper = await prisma.testPaper.findUnique({
        where: { id: testPaperId },
        include: {
          mcqs: {
            select: {
              id: true,
              correctAnswer: true,
              explanation: true,
            },
          },
        },
      });

      if (!testPaper) {
        return { success: false, error: "Test Paper not found." };
      }

      const data = testPaper.mcqs.map(mcq => ({
        id: mcq.id,
        answer: mcq.correctAnswer,
        explanation: mcq.explanation ?? "",
      }));

      return { success: true, data };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Failed to fetch answers and explanations." };
    }
  },

  async create(data: {
    name: string;
    topicId: string;
    description?: string;
    timeLimitMinutes?: number;
  }) {
    if (!data?.name || !data?.topicId)
      return { success: false, error: "Name and Topic ID are required." };
    try {
      const testPaper = await prisma.testPaper.create({ data });
      return { success: true, data: testPaper };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Failed to create Test Paper." };
    }
  },

  async update(id: string, data: Partial<{
    name: string;
    description: string;
    timeLimitMinutes: number;
    topicId: string;
  }>) {
    try {
      const testPaper = await prisma.testPaper.update({
        where: { id },
        data,
      });
      return { success: true, data: testPaper };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Failed to update test paper." };
    }
  },

  async moveToTrash(id: string) {
    if (!id) return { success: false, error: "Test Paper ID is required to move to trash." };
    try {
      const testPaper = await prisma.testPaper.findUnique({ where: { id } });
      if (!testPaper) return { success: false, error: "Test Paper not found." };

      const moved = await prisma.$transaction(async (tx) => {
        const updated = await tx.testPaper.update({
          where: { id },
          data: { deletedAt: new Date() },
        });
        await tx.trash.create({
          data: {
            tableName: "TestPaper",
            entityId: id,
          },
        });
        return updated;
      });
      return { success: true, data: moved };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Failed to move Test Paper to trash." };
    }
  },
};
