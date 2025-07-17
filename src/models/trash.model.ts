import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const trashModel = {
  async listAll() {
    return prisma.trash.findMany({
      orderBy: { trashedAt: "desc" },
    });
  },

  async add(tableName: string, entityId: string) {
    return prisma.trash.create({
      data: { tableName, entityId },
    });
  },

  async deleteById(trashId: string) {
    return prisma.trash.delete({ where: { id: trashId } });
  },

  async purgeAll() {
    return prisma.trash.deleteMany({});
  },

  async restore(trashId: string) {
    const trash = await prisma.trash.findUnique({ where: { id: trashId } });
    if (!trash) return null;

    const { tableName, entityId } = trash;

    switch (tableName) {
      case "Topic":
        await prisma.topic.update({
          where: { id: entityId },
          data: { deletedAt: null },
        });
        break;
      case "TestPaper":
        await prisma.testPaper.update({
          where: { id: entityId },
          data: { deletedAt: null },
        });
        break;
      case "MCQ":
        await prisma.mCQ.update({
          where: { id: entityId },
          data: { deletedAt: null },
        });
        break;
      case "Course":
        await prisma.course.update({
          where: { id: entityId },
          data: { deletedAt: null },
        });
        break;
      default:
        throw new Error(`Unknown table ${tableName}`);
    }

    return prisma.trash.delete({ where: { id: trashId } });
  },
};
