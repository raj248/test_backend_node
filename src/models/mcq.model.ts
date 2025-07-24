import { PrismaClient } from '@prisma/client';
import { sendNotification } from "~/utils/notificationUtil";
import admin from "firebase-admin";

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

  async create(data: {
    question: string;
    options: Record<string, string>;
    correctAnswer: string;
    topicId: string;
    testPaperId: string;
  }) {
    try {
      const mcq = await prisma.mCQ.create({ data });

      // Prepare and send notification after creation
      const message: admin.messaging.Message = {
        topic: "all-devices",
        notification: {
          title: "📝 New Question Added",
          body: `A new question has been added to your test.`,
        },
        data: {
          mcqId: mcq.id,
          topicId: mcq.topicId,
          testPaperId: mcq.testPaperId,
          type: "NEW_QUESTION",
        },
        android: { priority: "high" },
        apns: { headers: { "apns-priority": "10" } },
      };

      // Fire-and-forget; do not block MCQ creation if FCM fails
      sendNotification(message).catch((err) => {
        console.error("Failed to send notification for new MCQ:", err);
      });

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
