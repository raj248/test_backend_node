import { Request, Response } from "express";
import { trashModel } from "~/models/trash.model";
import { logger } from "~/utils/log";

export const trashController = {
  async list(req: Request, res: Response) {
    try {
      const result = await trashModel.getAll();
      if (!result.success) {
        logger.error(`trashController.list: ${result.error}`);
        return res.status(500).json(result);
      }
      res.json(result);
    } catch (error) {
      const err = error as Error;
      logger.error(`trashController.list: ${err.message}`);
      res.status(500).json({ success: false, error: "Failed to list trash items." });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ success: false, error: "Trash ID is required." });
      }

      const result = await trashModel.permanentlyDelete(id);

      if (!result.success) {
        logger.error(`trashController.delete: ${result.error}`);
        return res.status(500).json(result);
      }

      res.json({ success: true, message: "Trash item deleted permanently." });
    } catch (error) {
      const err = error as Error;
      logger.error(`trashController.delete: ${err.message}`);
      res.status(500).json({ success: false, error: "Failed to delete trash item." });
    }
  },

  async purge(req: Request, res: Response) {
    try {
      const result = await trashModel.purgeAll();

      if (!result.success) {
        logger.error(`trashController.purge: ${result.error}`);
        return res.status(500).json(result);
      }

      res.json({ success: true, message: "All trash purged permanently." });
    } catch (error) {
      const err = error as Error;
      logger.error(`trashController.purge: ${err.message}`);
      res.status(500).json({ success: false, error: "Failed to purge trash." });
    }
  },

  async restore(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ success: false, error: "Trash ID is required." });
      }

      const result = await trashModel.restore(id);

      if (!result.success) {
        logger.error(`trashController.restore: ${result.error}`);
        return res.status(404).json(result);
      }

      res.json({ success: true, message: "Item restored and removed from trash." });
    } catch (error) {
      const err = error as Error;
      logger.error(`trashController.restore: ${err.message}`);
      res.status(500).json({ success: false, error: "Failed to restore trash item." });
    }
  },
};
