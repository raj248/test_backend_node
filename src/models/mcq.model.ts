import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const mcqModel = {
  async getAll() {
    return prisma.mCQ.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "asc" },
    });
  },

  async getById(mcqId: string) {
    return prisma.mCQ.findUnique({
      where: { id: mcqId },
    });
  },

  async getByTestPaperId(testPaperId: string) {
    return prisma.mCQ.findMany({
      where: { testPaperId, deletedAt: null },
      orderBy: { createdAt: "asc" },
    });
  },

  async getByTopicId(topicId: string) {
    return prisma.mCQ.findMany({
      where: { topicId, deletedAt: null },
      orderBy: { createdAt: "asc" },
    });
  },


  async getForTest(testPaperId: string) {
    return prisma.mCQ.findMany({
      where: { testPaperId, deletedAt: null },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        question: true,
        options: true,
      },
    });
  },

  async create(data: {
    question: string;
    options: Record<string, string>;
    correctAnswer: string;
    topicId: string;
    testPaperId: string;
  }) {
    return prisma.mCQ.create({ data });
  },

  async update(mcqId: string, data: Partial<{
    question: string;
    options: Record<string, string>;
    correctAnswer: string;
  }>) {
    return prisma.mCQ.update({
      where: { id: mcqId },
      data,
    });
  },

  async moveToTrash(mcqId: string) {
    return prisma.$transaction(async (tx) => {
      const mcq = await tx.mCQ.update({
        where: { id: mcqId },
        data: { deletedAt: new Date() },
      });

      await tx.trash.create({
        data: {
          tableName: "MCQ",
          entityId: mcqId,
        },
      });

      return mcq;
    });
  },
};
