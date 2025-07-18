import { Request, Response } from "express";
import { TestPaperModel } from "~/models/testpaper.model";
import { logger } from "~/utils/log";

export const TestPaperController = {
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ success: false, error: "Test paper ID is required." });
      }

      const result = await TestPaperModel.getById(id);

      if (!result.success || !result.data) {
        logger.error(`TestPaperController.getById: ${result.error ?? "Test paper not found"}`);
        return res.status(404).json({ success: false, error: result.error ?? "Test paper not found" });
      }

      res.json({ success: true, data: result.data });
    } catch (error) {
      const err = error as Error;
      logger.error(`TestPaperController.getById: ${err.message}`);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const result = await TestPaperModel.getAll();

      if (!result.success) {
        logger.error(`TestPaperController.getAll: ${result.error}`);
        return res.status(500).json(result);
      }

      res.json(result);
    } catch (error) {
      const err = error as Error;
      logger.error(`TestPaperController.getAll: ${err.message}`);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { name, topicId, description, timeLimitMinutes, totalMarks } = req.body;

      if (!name || !topicId) {
        return res.status(400).json({
          success: false,
          error: "name and topicId are required",
        });
      }

      const result = await TestPaperModel.create({ name, topicId, description, timeLimitMinutes, totalMarks });

      if (!result.success) {
        logger.error(`TestPaperController.create: ${result.error}`);
        return res.status(500).json(result);
      }

      res.status(201).json(result);
    } catch (error) {
      const err = error as Error;
      logger.error(`TestPaperController.create: ${err.message}`);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, timeLimitMinutes, totalMarks } = req.body;

      if (!id) {
        return res.status(400).json({ success: false, error: "Test paper ID is required." });
      }

      const result = await TestPaperModel.update(id, { name, description, timeLimitMinutes, totalMarks });

      if (!result.success) {
        logger.error(`TestPaperController.update: ${result.error}`);
        return res.status(500).json(result);
      }

      res.json(result);
    } catch (error) {
      const err = error as Error;
      logger.error(`TestPaperController.update: ${err.message}`);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  },

  async moveToTrash(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ success: false, error: "Test paper ID is required." });
      }

      const result = await TestPaperModel.moveToTrash(id);

      if (!result.success) {
        logger.error(`TestPaperController.moveToTrash: ${result.error}`);
        return res.status(500).json(result);
      }

      res.json({ success: true, message: "Test paper moved to trash successfully." });
    } catch (error) {
      const err = error as Error;
      logger.error(`TestPaperController.moveToTrash: ${err.message}`);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  },
};
