// src/models/course.model.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const CourseModel = {
  async getAll() {
    return prisma.course.findMany({
      where: { deletedAt: null },
      include: { topics: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getById(id: string) {
    return prisma.course.findUnique({
      where: { id },
      include: { topics: true },
    });
  },

  async getTopicsByCourseType(courseType: 'CAInter' | 'CAFinal') {
    return prisma.course.findFirst({
      where: { courseType: courseType as any },
      include: {
        topics: {
          where: { deletedAt: null },
          orderBy: { createdAt: "asc" }
        }
      }
    });
  },

  async create(data: { name: string; courseType: 'CAInter' | 'CAFinal' }) {
    return prisma.course.create({ data });
  },

  async softDelete(id: string) {
    return prisma.course.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },
};
