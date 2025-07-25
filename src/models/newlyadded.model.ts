import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const newlyAddedModel = {
  async getAll() {
    try {
      const newlyAddedItems = await prisma.newlyAdded.findMany({
        orderBy: { addedAt: "desc" },
      });

      const enrichedItems = await Promise.all(
        newlyAddedItems.map(async (item) => {
          let displayName = "";

          try {
            switch (item.tableName) {
              case "MCQ":
                displayName = (await prisma.mCQ.findUnique({
                  where: { id: item.entityId },
                  select: { question: true },
                }))?.question ?? "(Deleted MCQ)";
                break;

              case "TestPaper":
                displayName = (await prisma.testPaper.findUnique({
                  where: { id: item.entityId },
                  select: { name: true },
                }))?.name ?? "(Deleted TestPaper)";
                break;

              case "Note":
                displayName = (await prisma.note.findUnique({
                  where: { id: item.entityId },
                  select: { name: true },
                }))?.name ?? "(Deleted Note)";
                break;

              case "VideoNote":
                displayName = "Video Note";
                break;

              default:
                displayName = "(Unknown Entity)";
            }
          } catch (error) {
            console.error(`Error enriching newly added item ${item.id}:`, error);
            displayName = "(Error Fetching Name)";
          }

          return { ...item, displayName };
        })
      );

      return { success: true, data: enrichedItems };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Failed to fetch newly added items." };
    }
  },

  async add(tableName: string, entityId: string) {
    try {
      const item = await prisma.newlyAdded.create({
        data: { tableName, entityId },
      });
      return { success: true, data: item };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Failed to add item to newly added." };
    }
  },

  async remove(id: string) {
    if (!id) return { success: false, error: "ID is required for removal." };

    try {
      await prisma.newlyAdded.delete({
        where: { id },
      });
      return { success: true, message: "Item removed from newly added." };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Failed to remove item from newly added." };
    }
  },
};
