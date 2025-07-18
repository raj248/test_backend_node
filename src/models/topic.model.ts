import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const TopicModel = {
  async fetchTopicById(topicId: string) {
    if (!topicId) return { success: false, error: "Topic ID is required." };
    try {
      const topic = await prisma.topic.findUnique({
        where: { id: topicId },
      });
      if (!topic) return { success: false, error: "Topic not found." };
      return { success: true, data: topic };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Failed to fetch Topic." };
    }
  },

  async fetchTestPaperByTopicId(topicId: string) {
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
            select: { id: true }, // for count/display
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });
      return { success: true, data: testPapers };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Failed to fetch Test Papers for Topic." };
    }
  },

  async create(data: { name: string; description?: string; courseType: "CAInter" | "CAFinal" }) {
    if (!data?.name || !data?.courseType) {
      return { success: false, error: "Name and course type are required." };
    }
    try {
      // Find course by courseType
      const course = await prisma.course.findFirst({
        where: { courseType: data.courseType },
        select: { id: true },
      });

      if (!course) {
        return { success: false, error: `Course with type ${data.courseType} not found.` };
      }

      const topic = await prisma.topic.create({
        data: {
          name: data.name,
          description: data.description,
          courseId: course.id,
        },
      });

      return { success: true, data: topic };
    } catch (error) {
      console.error("Topic create error:", error);
      return { success: false, error: "Failed to create topic." };
    }
  },

  async moveToTrash(topicId: string) {
    if (!topicId) return { success: false, error: "Topic ID is required to move to trash." };
    try {
      const topic = await prisma.topic.findUnique({ where: { id: topicId } });
      if (!topic) return { success: false, error: "Topic not found." };

      const movedTopic = await prisma.$transaction(async (tx) => {
        const deletedAt = new Date();

        // Soft delete MCQs
        await tx.mCQ.updateMany({
          where: { topicId },
          data: { deletedAt },
        });

        // Soft delete Test Papers
        await tx.testPaper.updateMany({
          where: { topicId },
          data: { deletedAt },
        });

        // Soft delete Topic
        const updatedTopic = await tx.topic.update({
          where: { id: topicId },
          data: { deletedAt },
        });

        // Add to Trash
        await tx.trash.create({
          data: {
            tableName: "Topic",
            entityId: topicId,
          },
        });

        return updatedTopic;
      });

      return { success: true, data: movedTopic };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Failed to move Topic to trash." };
    }
  },
};
