// src/server/controllers/note.controller.ts

import { Request, Response } from "express";
import { NoteModel } from "~/models/note.model";
import { logger } from "~/utils/log";
import { nanoid } from "nanoid";
import path from "path";
import multer from "multer";
import { sendNotification } from '~/utils/notificationUtil'
import admin from 'firebase-admin' // Required for `admin.messaging.Message`


// ✅ Multer configuration
const storage = multer.diskStorage({
  destination: "uploads/notes/",
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${nanoid()}${ext}`;
    cb(null, uniqueName);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed."));
    }
    cb(null, true);
  },
});

// ✅ Controller
export const NoteController = {
  async uploadNote(req: Request, res: Response) {
    try {
      const { name, description, type, topicId, courseType } = req.body;

      if (!name || !topicId || !courseType) {
        return res.status(400).json({
          success: false,
          error: "name, topicId, and courseType are required.",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "No file uploaded.",
        });
      }

      const result = await NoteModel.create({
        name,
        description,
        type,
        topicId,
        courseType,
        fileName: req.file.originalname,
        fileUrl: `/uploads/notes/${req.file.filename}`,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
      });

      if (!result.success) {
        logger.error(`NoteController.uploadNote: ${result.error}`);
        return res.status(500).json(result);
      }

      // ✅ Push notification after successful note creation
      const message: admin.messaging.Message = {
        topic: "all-devices",
        notification: {
          title: "📄 New Note Uploaded",
          body: `Note: ${name} is now available.`,
        },
        data: {
          type: "NEW_NOTE",
          noteId: result.data?.id || '',
          topicId: topicId,
          courseType: courseType,
        },
        android: { priority: "high" },
        apns: { headers: { "apns-priority": "10" } },
      };

      sendNotification(message).catch((err) => {
        logger.error("Failed to send notification for new note:" + err);
      });

      res.status(201).json(result);
    } catch (error) {
      const err = error as Error;
      logger.error(`NoteController.uploadNote: ${err.message}`);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const result = await NoteModel.getAll();

      if (!result.success) {
        logger.error(`NoteController.getAll: ${result.error}`);
        return res.status(500).json(result);
      }

      res.json(result);
    } catch (error) {
      const err = error as Error;
      logger.error(`NoteController.getAll: ${err.message}`);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          error: "Note ID is required.",
        });
      }

      const result = await NoteModel.getById(id);

      if (!result.success || !result.data) {
        logger.error(`NoteController.getById: ${result.error ?? "Note not found"}`);
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      const err = error as Error;
      logger.error(`NoteController.getById: ${err.message}`);
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

      const result = await NoteModel.findByTopicId(topicId, String(type));

      if (!result.success) {
        logger.error(`NoteController.findByTopicId: ${result.error}`);
        return res.status(500).json(result);
      }

      res.json(result);
    } catch (error) {
      const err = error as Error;
      logger.error(`NoteController.findByTopicId: ${err.message}`);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  },

  async moveToTrash(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          error: "Note ID is required.",
        });
      }

      const result = await NoteModel.moveToTrash(id);

      if (!result.success) {
        logger.error(`NoteController.moveToTrash: ${result.error}`);
        return res.status(500).json(result);
      }

      res.json({ success: true, message: "Note moved to trash successfully." });
    } catch (error) {
      const err = error as Error;
      logger.error(`NoteController.moveToTrash: ${err.message}`);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  },
};
