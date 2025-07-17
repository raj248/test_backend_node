import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const TestPaperModel = {
  async getById(testPaperId: string) {
    return prisma.testPaper.findUnique({
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
  },

  async findByTopicId(topicId: string) {
    return prisma.testPaper.findMany({
      where: {
        topicId,
        deletedAt: null,
      },
      include: {
        mcqs: {
          where: { deletedAt: null },
          select: { id: true }, // lightweight for count/display
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  },

  async getAll() {
    return prisma.testPaper.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "asc" },
      include: { topic: true },
    });
  },

  async create(data: { name: string; topicId: string }) {
    return prisma.testPaper.create({
      data,
    });
  },

  async moveToTrash(id: string) {
    return prisma.testPaper.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },
};
