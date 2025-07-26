// src/models/course.model.ts
import { PrismaClient } from '@prisma/client';
import { logger } from '~/utils/log';

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
      logger.error(error);
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
      logger.error(error);
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
            include: {
              testPapers: {
                where: { deletedAt: null },
                select: { id: true }, // Only need IDs to count
              },
              notes: {
                where: { deletedAt: null },
                select: { id: true },
              },
              videoNotes: {
                where: { deletedAt: null },
                select: { id: true },
              },
            },
          },
        },
      });


      if (!course) return { success: false, error: "Course with specified type not found." };

      // Clean JSON-serializable structure with counts
      const data = {
        ...course,
        topics: course.topics.map(topic => ({
          id: topic.id,
          name: topic.name,
          description: topic.description,
          courseId: topic.courseId,
          courseType,
          createdAt: topic.createdAt,
          updatedAt: topic.updatedAt,
          deletedAt: topic.deletedAt,
          testPaperCount: topic.testPapers.length,
          noteCount: topic.notes.length,
          videoNoteCount: topic.videoNotes.length,
        })),
      };


      return { success: true, data };
    } catch (error) {
      logger.error(error);
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
      logger.error(error);
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
      logger.error(error);
      return { success: false, error: "Failed to delete course." };
    }
  },
};
