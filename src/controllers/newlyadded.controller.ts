import { Request, Response } from "express";
import { newlyAddedModel } from "~/models/newlyadded.model";
import { logger } from "~/utils/log";

export const newlyAddedController = {
  async list(req: Request, res: Response) {
    try {
      const result = await newlyAddedModel.getAll();
      if (!result.success) {
        logger.error(`newlyAddedController.list: ${result.error}`);
        return res.status(500).json(result);
      }
      res.json(result);
    } catch (error) {
      const err = error as Error;
      logger.error(`newlyAddedController.list: ${err.message}`);
      res.status(500).json({ success: false, error: "Failed to list newly added items." });
    }
  },

  async add(req: Request, res: Response) {
    try {
      const { tableName, entityId } = req.body;
      if (!tableName || !entityId) {
        return res.status(400).json({
          success: false,
          error: "tableName and entityId are required to add to newly added.",
        });
      }

      const result = await newlyAddedModel.add(tableName, entityId);
      if (!result.success) {
        logger.error(`newlyAddedController.add: ${result.error}`);
        return res.status(500).json(result);
      }

      res.json({ success: true, data: result.data });
    } catch (error) {
      const err = error as Error;
      logger.error(`newlyAddedController.add: ${err.message}`);
      res.status(500).json({ success: false, error: "Failed to add item to newly added." });
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ success: false, error: "ID is required for removal." });
      }

      const result = await newlyAddedModel.remove(id);
      if (!result.success) {
        logger.error(`newlyAddedController.remove: ${result.error}`);
        return res.status(500).json(result);
      }

      res.json({ success: true, message: "Item removed from newly added." });
    } catch (error) {
      const err = error as Error;
      logger.error(`newlyAddedController.remove: ${err.message}`);
      res.status(500).json({ success: false, error: "Failed to remove item from newly added." });
    }
  },
};
