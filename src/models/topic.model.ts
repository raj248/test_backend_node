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

  async moveTopicToTrash(topicId: string) {
    const topic = await prisma.topic.update({
      where: { id: topicId },
      data: { deletedAt: new Date() },
    });

    await prisma.trash.create({
      data: {
        tableName: "Topic",
        entityId: topicId,
        reason: "User requested move to trash",
      },
    });

    return topic;
  },

};
