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

  async moveToTrash(topicId: string,) {
    return await prisma.$transaction(async (tx) => {
      // Soft delete MCQs
      await tx.mCQ.updateMany({
        where: { topicId },
        data: { deletedAt: new Date() },
      });

      // Soft delete TestPapers
      await tx.testPaper.updateMany({
        where: { topicId },
        data: { deletedAt: new Date() },
      });

      // Soft delete Topic and fetch updated data
      const topic = await tx.topic.update({
        where: { id: topicId },
        data: { deletedAt: new Date() },
      });

      // Add to Trash
      await tx.trash.create({
        data: {
          tableName: "Topic",
          entityId: topicId,
        },
      });

      // Return the updated topic for frontend confirmation
      return topic;
    });
  }
};
