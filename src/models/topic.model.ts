import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const TopicModel = {
  async fetchTopicById(topicId: string) {
    return prisma.topic.findUnique({
      where: {
        id: topicId,
      },
    })
  },

  async fetchTestPaperByTopicId(topicId: string) {
    return prisma.testPaper.findMany({
      where: {
        topicId,
        deletedAt: null,
      },
      include: {
        mcqs: {
          where: { deletedAt: null },
          select: { id: true }, // only fetch id for counting
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  },
};
