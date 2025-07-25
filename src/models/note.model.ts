// src/lib/models/note.model.ts

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

interface NoteData {
  name: string;
  description?: string;
  type: "rtp" | "mtp" | "other";
  topicId: string;
  courseType: "CAInter" | "CAFinal";
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}

export const NoteModel = {
  async create(data: NoteData) {
    if (!data?.name || !data?.topicId || !data?.courseType || !data?.fileName || !data?.fileUrl) {
      return { success: false, error: "Required fields missing while creating note." };
    }
    try {
      const note = await prisma.note.create({
        data,
      });
      return { success: true, data: note };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Failed to create note." };
    }
  },

  async getAll() {
    try {
      const notes = await prisma.note.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
      });

      // Fetch newlyAdded entries in a single query
      const newlyAddedItems = await prisma.newlyAdded.findMany({
        where: {
          tableName: "Note",
          entityId: { in: notes.map(note => note.id) },
        },
        select: {
          id: true,
          entityId: true,
        },
      });

      const newlyAddedMap = new Map(
        newlyAddedItems.map(item => [item.entityId, item.id])
      );

      const enrichedNotes = notes.map(note => ({
        ...note,
        newlyAddedId: newlyAddedMap.get(note.id) ?? null,
      }));

      return { success: true, data: enrichedNotes };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Failed to fetch notes." };
    }
  },

  async getById(noteId: string) {
    if (!noteId) return { success: false, error: "Note ID is required." };
    try {
      const note = await prisma.note.findUnique({
        where: { id: noteId },
      });
      if (!note) return { success: false, error: "Note not found." };
      return { success: true, data: note };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Failed to fetch note." };
    }
  },

  async findByTopicId(topicId: string) {
    if (!topicId) return { success: false, error: "Topic ID is required." };

    try {
      const notes = await prisma.note.findMany({
        where: { topicId, deletedAt: null },
        orderBy: { createdAt: "desc" },
      });

      // Fetch newlyAdded entries efficiently
      const newlyAddedItems = await prisma.newlyAdded.findMany({
        where: {
          tableName: "Note",
          entityId: { in: notes.map(note => note.id) },
        },
        select: {
          id: true,
          entityId: true,
        },
      });

      const newlyAddedMap = new Map(
        newlyAddedItems.map(item => [item.entityId, item.id])
      );

      const enrichedNotes = notes.map(note => ({
        ...note,
        newlyAddedId: newlyAddedMap.get(note.id) ?? null,
      }));

      return { success: true, data: enrichedNotes };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Failed to fetch notes by topic ID." };
    }
  },

  async moveToTrash(id: string) {
    if (!id) return { success: false, error: "Note ID is required to move to trash." };
    try {
      const note = await prisma.note.findUnique({ where: { id } });
      if (!note) return { success: false, error: "Note not found." };

      const moved = await prisma.$transaction(async (tx) => {
        const updated = await tx.note.update({
          where: { id },
          data: { deletedAt: new Date() },
        });
        await tx.trash.create({
          data: {
            tableName: "Note",
            entityId: id,
          },
        });
        return updated;
      });
      return { success: true, data: moved };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Failed to move note to trash." };
    }
  },
};
