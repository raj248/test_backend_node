// src/lib/models/videonote.model.ts

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

interface VideoNoteData {
  url: string;
  topicId: string;
  courseType: "CAInter" | "CAFinal";
}

export const VideoNoteModel = {
  async create(data: VideoNoteData) {
    if (!data?.url || !data?.topicId || !data?.courseType) {
      return { success: false, error: "Required fields missing while creating video note." };
    }
    try {
      const videoNote = await prisma.videoNote.create({
        data,
      });
      return { success: true, data: videoNote };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Failed to create video note." };
    }
  },

  async getAll() {
    try {
      const videoNotes = await prisma.videoNote.findMany({
        orderBy: { createdAt: "desc" },
      });
      return { success: true, data: videoNotes };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Failed to fetch video notes." };
    }
  },

  async getById(id: string) {
    if (!id) return { success: false, error: "Video note ID is required." };
    try {
      const videoNote = await prisma.videoNote.findUnique({
        where: { id },
      });
      if (!videoNote) return { success: false, error: "Video note not found." };
      return { success: true, data: videoNote };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Failed to fetch video note." };
    }
  },

  async findByTopicId(topicId: string) {
    if (!topicId) return { success: false, error: "Topic ID is required." };
    try {
      const videoNotes = await prisma.videoNote.findMany({
        where: { topicId, deletedAt: null },
        orderBy: { createdAt: "desc" },
      });
      return { success: true, data: videoNotes };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Failed to fetch video notes by topic ID." };
    }
  },

  async moveToTrash(id: string) {
    if (!id) return { success: false, error: "Video note ID is required to move to trash." };
    try {
      const videoNote = await prisma.videoNote.findUnique({ where: { id } });
      if (!videoNote) return { success: false, error: "Video note not found." };

      const moved = await prisma.$transaction(async (tx) => {
        const deleted = await tx.videoNote.update({
          where: { id },
          data: { deletedAt: new Date() },
        });
        await tx.trash.create({
          data: {
            tableName: "VideoNote",
            entityId: id,
          },
        });
        return deleted;
      });

      return { success: true, data: moved };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Failed to move video note to trash." };
    }
  },
};
