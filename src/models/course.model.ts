// src/models/course.model.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const CourseModel = {
  async getAll() {
    try {
      const courses = await prisma.course.findMany({
        where: { deletedAt: null },
        include: { topics: true },
        orderBy: { createdAt: 'desc' },
      });
      return { success: true, data: courses };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Failed to fetch courses." };
    }
  },

  async getById(id: string) {
    if (!id) return { success: false, error: "Course ID is required." };
    try {
      const course = await prisma.course.findUnique({
        where: { id },
        include: { topics: true },
      });
      if (!course) return { success: false, error: "Course not found." };
      return { success: true, data: course };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Failed to fetch course." };
    }
  },

  async getTopicsByCourseType(courseType: 'CAInter' | 'CAFinal') {
    if (!courseType) return { success: false, error: "Course type is required." };
    try {
      const course = await prisma.course.findFirst({
        where: { courseType },
        include: {
          topics: {
            where: { deletedAt: null },
            orderBy: { createdAt: "asc" },
          },
        },
      });
      if (!course) return { success: false, error: "Course with specified type not found." };
      return { success: true, data: course };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Failed to fetch topics by course type." };
    }
  },

  async create(data: { name: string; courseType: 'CAInter' | 'CAFinal' }) {
    if (!data?.name || !data?.courseType) {
      return { success: false, error: "Name and course type are required." };
    }
    try {
      const course = await prisma.course.create({ data });
      return { success: true, data: course };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Failed to create course." };
    }
  },

  async moveToTrash(id: string) {
    if (!id) return { success: false, error: "Course ID is required to delete." };
    try {
      const course = await prisma.course.findUnique({ where: { id } });
      if (!course) return { success: false, error: "Course not found." };

      const deletedCourse = await prisma.course.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      return { success: true, data: deletedCourse };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Failed to delete course." };
    }
  },
};
