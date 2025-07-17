// src/server/models/trash.model.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const trashModel = {
  async getAll() {
    return prisma.trash.findMany({
      orderBy: { trashedAt: "desc" },
    });
  },

  async add(tableName: string, entityId: string) {
    return prisma.trash.create({
      data: { tableName, entityId },
    });
  },

  async purgeAll() {
    const trashItems = await prisma.trash.findMany();

    for (const item of trashItems) {
      try {
        await this.permanentlyDelete(item.id);
      } catch (error) {
        console.error(`Failed to permanently delete trash item ${item.id}`, error);
        // Optionally continue or throw to halt on error
      }
    }
    return { success: true, message: "Trash fully purged with permanent deletion." };
  },

  async restore(trashId: string) {
    const trash = await prisma.trash.findUnique({ where: { id: trashId } });
    if (!trash) return null;

    const { tableName, entityId } = trash;

    await prisma.$transaction(async (tx) => {
      switch (tableName) {
        case "Topic":
          await tx.topic.update({
            where: { id: entityId },
            data: { deletedAt: null },
          });
          await tx.testPaper.updateMany({
            where: { topicId: entityId },
            data: { deletedAt: null },
          });
          await tx.mCQ.updateMany({
            where: { topicId: entityId },
            data: { deletedAt: null },
          });
          break;
        case "TestPaper":
          await tx.testPaper.update({
            where: { id: entityId },
            data: { deletedAt: null },
          });
          await tx.mCQ.updateMany({
            where: { testPaperId: entityId },
            data: { deletedAt: null },
          });
          break;
        case "MCQ":
          await tx.mCQ.update({
            where: { id: entityId },
            data: { deletedAt: null },
          });
          break;
        case "Course":
          await tx.course.update({
            where: { id: entityId },
            data: { deletedAt: null },
          });
          await tx.topic.updateMany({
            where: { courseId: entityId },
            data: { deletedAt: null },
          });
          const topics = await tx.topic.findMany({
            where: { courseId: entityId },
            select: { id: true },
          });
          const topicIds = topics.map((t) => t.id);
          await tx.testPaper.updateMany({
            where: { topicId: { in: topicIds } },
            data: { deletedAt: null },
          });
          await tx.mCQ.updateMany({
            where: { topicId: { in: topicIds } },
            data: { deletedAt: null },
          });
          break;
        default:
          throw new Error(`Unknown table ${tableName}`);
      }

      await tx.trash.delete({ where: { id: trashId } });
    });

    return true;
  },

  async permanentlyDelete(trashId: string) {
    const trash = await prisma.trash.findUnique({ where: { id: trashId } });
    if (!trash) return null;

    const { tableName, entityId } = trash;

    await prisma.$transaction(async (tx) => {
      switch (tableName) {
        case "Topic":
          await tx.mCQ.deleteMany({
            where: { topicId: entityId },
          });
          await tx.testPaper.deleteMany({
            where: { topicId: entityId },
          });
          await tx.topic.delete({
            where: { id: entityId },
          });
          break;
        case "TestPaper":
          await tx.mCQ.deleteMany({
            where: { testPaperId: entityId },
          });
          await tx.testPaper.delete({
            where: { id: entityId },
          });
          break;
        case "MCQ":
          await tx.mCQ.delete({
            where: { id: entityId },
          });
          break;
        case "Course":
          const topics = await tx.topic.findMany({
            where: { courseId: entityId },
            select: { id: true },
          });
          const topicIds = topics.map((t) => t.id);
          await tx.mCQ.deleteMany({
            where: { topicId: { in: topicIds } },
          });
          await tx.testPaper.deleteMany({
            where: { topicId: { in: topicIds } },
          });
          await tx.topic.deleteMany({
            where: { courseId: entityId },
          });
          await tx.course.delete({
            where: { id: entityId },
          });
          break;
        default:
          throw new Error(`Unknown table ${tableName}`);
      }

      await tx.trash.delete({ where: { id: trashId } });
    });

    return true;
  },
};
