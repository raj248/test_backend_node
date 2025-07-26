import { PrismaClient } from '@prisma/client';
import { logger } from '~/utils/log';

const prisma = new PrismaClient();

export const SearchModel = {
  async searchAll(query: string) {
    try {
      const [topics, testPapers, notes, videoNotes] = await Promise.all([
        prisma.topic.findMany({
          where: {
            deletedAt: null,
            name: { contains: query, mode: 'insensitive' },
          },
        }),
        prisma.testPaper.findMany({
          where: {
            deletedAt: null,
            name: { contains: query, mode: 'insensitive' },
          },
        }),
        prisma.note.findMany({
          where: {
            deletedAt: null,
            name: { contains: query, mode: 'insensitive' },
          },
        }),
        prisma.videoNote.findMany({
          where: {
            deletedAt: null,
            name: { contains: query, mode: 'insensitive' },
          },
        }),
      ]);

      return {
        success: true,
        data: {
          topics,
          testPapers,
          notes,
          videoNotes,
        },
      };
    } catch (error) {
      logger.error("Search error:" + error);
      return { success: false, error: 'Search failed due to server error.' };
    }
  },
};
