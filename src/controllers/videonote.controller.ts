// src/server/controllers/videonote.controller.ts

import { Request, Response } from "express";
import { VideoNoteModel } from "~/models/videonote.model";
import { logger } from "~/utils/log";

// ✅ Controller
export const VideoNoteController = {
  async addVideoNote(req: Request, res: Response) {
    try {
      const { url, topicId, courseType, type } = req.body;

      if (!url || !topicId || !courseType) {
        return res.status(400).json({
          success: false,
          error: "url, topicId, and courseType are required.",
        });
      }

      const result = await VideoNoteModel.create({
        url,
        topicId,
        courseType,
        type,
      });

      if (!result.success) {
        logger.error(`VideoNoteController.addVideoNote: ${result.error}`);
        return res.status(500).json(result);
      }

      res.status(201).json(result);
    } catch (error) {
      const err = error as Error;
      logger.error(`VideoNoteController.addVideoNote: ${err.message}`);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  },


  async getAll(req: Request, res: Response) {
    try {
      const result = await VideoNoteModel.getAll();

      if (!result.success) {
        logger.error(`VideoNoteController.getAll: ${result.error}`);
        return res.status(500).json(result);
      }

      res.json(result);
    } catch (error) {
      const err = error as Error;
      logger.error(`VideoNoteController.getAll: ${err.message}`);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          error: "VideoNote ID is required.",
        });
      }

      const result = await VideoNoteModel.getById(id);

      if (!result.success || !result.data) {
        logger.error(`VideoNoteController.getById: ${result.error ?? "VideoNote not found"}`);
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      const err = error as Error;
      logger.error(`VideoNoteController.getById: ${err.message}`);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  },

  async findByTopicId(req: Request, res: Response) {
    try {
      const { topicId } = req.params;
      const { type = "all" } = req.query;

      if (!topicId) {
        return res.status(400).json({
          success: false,
          error: "Topic ID is required.",
        });
      }

      const result = await VideoNoteModel.findByTopicId(topicId, String(type));

      if (!result.success) {
        logger.error(`VideoNoteController.findByTopicId: ${result.error}`);
        return res.status(500).json(result);
      }

      res.json(result);
    } catch (error) {
      const err = error as Error;
      logger.error(`VideoNoteController.findByTopicId: ${err.message}`);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  },

  async moveToTrash(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          error: "VideoNote ID is required.",
        });
      }

      const result = await VideoNoteModel.moveToTrash(id);

      if (!result.success) {
        logger.error(`VideoNoteController.moveToTrash: ${result.error}`);
        return res.status(500).json(result);
      }

      res.json({ success: true, message: "Video note moved to trash successfully." });
    } catch (error) {
      const err = error as Error;
      logger.error(`VideoNoteController.moveToTrash: ${err.message}`);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  },
};
