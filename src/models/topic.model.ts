import { PrismaClient } from '@prisma/client';
import { logger } from '~/utils/log';

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
      logger.error(error);
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
            select: {
              id: true,
              marks: true, // include marks to calculate total
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      // Calculate totalMarks and mcq count per test paper
      const enrichedTestPapers = testPapers.map((tp) => ({
        ...tp,
        totalMarks: tp.mcqs.reduce((sum, mcq) => sum + (mcq.marks ?? 0), 0),
        mcqCount: tp.mcqs.length,
        mcqs: undefined, // optionally remove raw mcqs if you only want counts
      }));

      return { success: true, data: enrichedTestPapers };
    } catch (error) {
      logger.error(error);
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
      logger.error("Topic create error:" + error);
      return { success: false, error: "Failed to create topic." };
    }
  },

  async update(
    id: string,
    data: {
      name?: string;
      description?: string;
      courseType?: "CAInter" | "CAFinal";
    }
  ) {
    if (!id) {
      return { success: false, error: "Topic ID is required." };
    }

    try {
      const updateData: Record<string, any> = {};

      if (data.name) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;

      if (data.courseType) {
        const course = await prisma.course.findFirst({
          where: { courseType: data.courseType },
          select: { id: true },
        });

        if (!course) {
          return { success: false, error: `Course with type ${data.courseType} not found.` };
        }

        updateData.courseId = course.id;
      }

      const updatedTopic = await prisma.topic.update({
        where: { id },
        data: updateData,
      });

      return { success: true, data: updatedTopic };
    } catch (error) {
      logger.error("Topic update error:" + error);
      return { success: false, error: "Failed to update topic." };
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
      logger.error(error);
      return { success: false, error: "Failed to move Topic to trash." };
    }
  },
};
