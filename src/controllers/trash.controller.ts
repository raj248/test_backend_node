import { Request, Response } from "express";
import { trashModel } from "~/models/trash.model";

export const trashController = {
  async list(req: Request, res: Response) {
    const items = await trashModel.listAll();
    res.json(items);
  },

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    await trashModel.deleteById(id);
    res.json({ message: "Trash item deleted permanently." });
  },

  async purge(req: Request, res: Response) {
    await trashModel.purgeAll();
    res.json({ message: "All trash purged permanently." });
  },

  async restore(req: Request, res: Response) {
    const { id } = req.params;
    const restored = await trashModel.restore(id);
    if (!restored) {
      res.status(404).json({ error: "Trash item not found or cannot be restored." });
    } else {
      res.json({ message: "Restored and removed from trash." });
    }
  },
};
