import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const mcqModel = {
  async getAll() {
    try {
      const mcqs = await prisma.mCQ.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "asc" },
      });
      return { success: true, data: mcqs };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Failed to fetch MCQs." };
    }
  },

  async getById(mcqId: string) {
    if (!mcqId) return { success: false, error: "MCQ ID is required." };
    try {
      const mcq = await prisma.mCQ.findUnique({ where: { id: mcqId } });
      if (!mcq) return { success: false, error: "MCQ not found." };
      return { success: true, data: mcq };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Failed to fetch MCQ." };
    }
  },

  async getByTestPaperId(testPaperId: string) {
    if (!testPaperId) return { success: false, error: "Test Paper ID is required." };
    try {
      const mcqs = await prisma.mCQ.findMany({
        where: { testPaperId, deletedAt: null },
        orderBy: { createdAt: "asc" },
      });
      return { success: true, data: mcqs };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Failed to fetch MCQs by Test Paper ID." };
    }
  },

  async getByTopicId(topicId: string) {
    if (!topicId) return { success: false, error: "Topic ID is required." };
    try {
      const mcqs = await prisma.mCQ.findMany({
        where: { topicId, deletedAt: null },
        orderBy: { createdAt: "asc" },
      });
      return { success: true, data: mcqs };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Failed to fetch MCQs by Topic ID." };
    }
  },

  async getForTest(testPaperId: string) {
    if (!testPaperId) return { success: false, error: "Test Paper ID is required." };
    try {
      const mcqs = await prisma.mCQ.findMany({
        where: { testPaperId, deletedAt: null },
        orderBy: { createdAt: "asc" },
        select: { id: true, question: true, options: true },
      });
      return { success: true, data: mcqs };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Failed to fetch MCQs for test." };
    }
  },

  async create(data: {
    question: string;
    options: Record<string, string>;
    correctAnswer: string;
    topicId: string;
    testPaperId: string;
  }) {
    try {
      const mcq = await prisma.mCQ.create({ data });
      return { success: true, data: mcq };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Failed to create MCQ." };
    }
  },

  async update(mcqId: string, data: Partial<{
    question: string;
    options: Record<string, string>;
    explanation: string;
    marks: number;
    correctAnswer: string;
  }>) {
    if (!mcqId) return { success: false, error: "MCQ ID is required." };
    try {
      const mcq = await prisma.mCQ.update({
        where: { id: mcqId },
        data,
      });
      return { success: true, data: mcq };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Failed to update MCQ." };
    }
  },

  async moveToTrash(mcqId: string) {
    if (!mcqId) return { success: false, error: "MCQ ID is required to move to trash." };
    try {
      const mcq = await prisma.mCQ.findUnique({ where: { id: mcqId } });
      if (!mcq) return { success: false, error: "MCQ not found." };

      const result = await prisma.$transaction(async (tx) => {
        const updatedMcq = await tx.mCQ.update({
          where: { id: mcqId },
          data: { deletedAt: new Date() },
        });
        await tx.trash.create({
          data: {
            tableName: "MCQ",
            entityId: mcqId,
          },
        });
        return updatedMcq;
      });

      return { success: true, data: result };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Failed to move MCQ to trash." };
    }
  },
};
