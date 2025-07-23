import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import fs from "fs";
import path from "path";

export const trashModel = {
  async getAll() {
    try {
      const trashItems = await prisma.trash.findMany({
        orderBy: { trashedAt: "desc" },
      });

      const enrichedItems = await Promise.all(
        trashItems.map(async (item) => {
          let displayName = "";

          try {
            switch (item.tableName) {
              case "Topic":
                displayName = (await prisma.topic.findUnique({
                  where: { id: item.entityId },
                  select: { name: true },
                }))?.name ?? "(Deleted Topic)";
                break;
              case "TestPaper":
                displayName = (await prisma.testPaper.findUnique({
                  where: { id: item.entityId },
                  select: { name: true },
                }))?.name ?? "(Deleted TestPaper)";
                break;
              case "MCQ":
                displayName = (await prisma.mCQ.findUnique({
                  where: { id: item.entityId },
                  select: { question: true },
                }))?.question ?? "(Deleted MCQ)";
                break;
              case "Course":
                displayName = (await prisma.course.findUnique({
                  where: { id: item.entityId },
                  select: { name: true },
                }))?.name ?? "(Deleted Course)";
                break;
              case "Note":
                displayName = (await prisma.note.findUnique({
                  where: { id: item.entityId },
                  select: { name: true },
                }))?.name ?? "(Deleted Note)";
                break;
              default:
                displayName = "(Unknown Entity)";
            }
          } catch (error) {
            console.error(`Error enriching trash item ${item.id}:`, error);
            displayName = "(Error Fetching Name)";
          }

          return { ...item, displayName };
        })
      );

      return { success: true, data: enrichedItems };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Failed to fetch trash items." };
    }
  },

  async add(tableName: string, entityId: string) {
    try {
      const item = await prisma.trash.create({
        data: { tableName, entityId },
      });
      return { success: true, data: item };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Failed to add item to trash." };
    }
  },

  async purgeAll() {
    try {
      const trashItems = await prisma.trash.findMany();

      for (const item of trashItems) {
        try {
          await this.permanentlyDelete(item.id);
        } catch (error) {
          console.error(`Failed to permanently delete trash item ${item.id}`, error);
        }
      }

      return { success: true, message: "Trash purged with permanent deletion." };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Failed to purge trash." };
    }
  },

  async restore(trashId: string) {
    if (!trashId) return { success: false, error: "Trash ID is required." };

    try {
      const trash = await prisma.trash.findUnique({ where: { id: trashId } });
      if (!trash) return { success: false, error: "Trash item not found." };

      const { tableName, entityId } = trash;

      await prisma.$transaction(async (tx) => {
        switch (tableName) {
          case "Topic":
            await tx.topic.update({ where: { id: entityId }, data: { deletedAt: null } });
            await tx.testPaper.updateMany({
              where: { topicId: entityId },
              data: { deletedAt: null },
            });
            await tx.mCQ.updateMany({
              where: { topicId: entityId },
              data: { deletedAt: null },
            });
            await tx.note.updateMany({
              where: { topicId: entityId },
              data: { deletedAt: null },
            });
            await tx.videoNote.updateMany({
              where: { topicId: entityId },
              data: { deletedAt: null },
            });
            break;

          case "TestPaper":
            await tx.testPaper.update({ where: { id: entityId }, data: { deletedAt: null } });
            await tx.mCQ.updateMany({
              where: { testPaperId: entityId },
              data: { deletedAt: null },
            });
            break;

          case "MCQ":
            await tx.mCQ.update({ where: { id: entityId }, data: { deletedAt: null } });
            break;

          case "Course":
            await tx.course.update({ where: { id: entityId }, data: { deletedAt: null } });
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
            await tx.note.updateMany({
              where: { topicId: { in: topicIds } },
              data: { deletedAt: null },
            });
            await tx.videoNote.updateMany({
              where: { topicId: { in: topicIds } },
              data: { deletedAt: null },
            });
            break;

          case "Note":
            await tx.note.update({ where: { id: entityId }, data: { deletedAt: null } });
            break;

          case "VideoNote":
            await tx.videoNote.update({ where: { id: entityId }, data: { deletedAt: null } });
            break;

          default:
            throw new Error(`Unknown table ${tableName}`);
        }

        await tx.trash.delete({ where: { id: trashId } });
      });

      return { success: true, message: "Trash item restored successfully." };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Failed to restore trash item." };
    }
  },

  async permanentlyDelete(trashId: string) {
    if (!trashId) return { success: false, error: "Trash ID is required." };

    try {
      const trash = await prisma.trash.findUnique({ where: { id: trashId } });
      if (!trash) return { success: false, error: "Trash item not found." };

      const { tableName, entityId } = trash;
      let deletedNoteFileUrl: string | null = null; // for post-deletion file cleanup

      await prisma.$transaction(async (tx) => {
        switch (tableName) {
          case "Topic":
            await tx.mCQ.deleteMany({ where: { topicId: entityId } });
            await tx.testPaper.deleteMany({ where: { topicId: entityId } });
            await tx.note.deleteMany({ where: { topicId: entityId } });
            await tx.videoNote.deleteMany({ where: { topicId: entityId } });
            await tx.topic.delete({ where: { id: entityId } });
            break;

          case "TestPaper":
            await tx.mCQ.deleteMany({ where: { testPaperId: entityId } });
            await tx.testPaper.delete({ where: { id: entityId } });
            break;

          case "MCQ":
            await tx.mCQ.delete({ where: { id: entityId } });
            break;

          case "Course":
            const topics = await tx.topic.findMany({
              where: { courseId: entityId },
              select: { id: true },
            });
            const topicIds = topics.map((t) => t.id);
            await tx.mCQ.deleteMany({ where: { topicId: { in: topicIds } } });
            await tx.testPaper.deleteMany({ where: { topicId: { in: topicIds } } });
            await tx.note.deleteMany({ where: { topicId: { in: topicIds } } });
            await tx.videoNote.deleteMany({ where: { topicId: { in: topicIds } } });
            await tx.topic.deleteMany({ where: { courseId: entityId } });
            await tx.course.delete({ where: { id: entityId } });
            break;

          case "Note":
            const note = await tx.note.findUnique({
              where: { id: entityId },
              select: { fileUrl: true },
            });
            if (note?.fileUrl) {
              deletedNoteFileUrl = note.fileUrl; // capture for deletion after transaction
            }
            await tx.note.delete({ where: { id: entityId } });
            break;

          case "VideoNote":
            await tx.videoNote.delete({ where: { id: entityId } });
            break;

          default:
            throw new Error(`Unknown table ${tableName}`);
        }

        await tx.trash.delete({ where: { id: trashId } });
      });

      // Clean up the physical file if needed after successful DB deletion
      if (deletedNoteFileUrl) {
        const filePath = path.join(process.cwd(), deletedNoteFileUrl);
        try {
          await fs.promises.unlink(filePath);
          console.log(`Deleted file at ${filePath}`);
        } catch (fileError) {
          console.error(`Failed to delete file at ${filePath}`, fileError);
        }
      }

      return { success: true, message: "Trash item permanently deleted." };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Failed to permanently delete trash item." };
    }
  },

};
