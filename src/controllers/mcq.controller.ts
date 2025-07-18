import { Request, Response } from "express";
import { mcqModel } from "~/models/mcq.model";
import { logger } from "~/utils/log";

export const mcqController = {
  async getAll(req: Request, res: Response) {
    try {
      const result = await mcqModel.getAll();
      if (!result.success) {
        logger.error(`mcqController.getAll: ${result.error}`);
        return res.status(500).json(result);
      }
      res.json(result);
    } catch (error) {
      const err = error as Error;
      logger.error(`mcqController.getAll: ${err.message}`);
      res.status(500).json({ success: false, error: "Failed to fetch MCQs" });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ success: false, error: "MCQ ID is required" });
      }
      const result = await mcqModel.getById(id);
      if (!result.success || !result.data) {
        logger.error(`mcqController.getById: ${result.error ?? "MCQ not found"}`);
        return res.status(404).json({ success: false, error: result.error ?? "MCQ not found" });
      }
      res.json({ success: true, data: result.data });
    } catch (error) {
      const err = error as Error;
      logger.error(`mcqController.getById: ${err.message}`);
      res.status(500).json({ success: false, error: "Failed to fetch MCQ" });
    }
  },

  async getByTopicId(req: Request, res: Response) {
    try {
      const { topicId } = req.params;
      if (!topicId) {
        return res.status(400).json({ success: false, error: "Topic ID is required" });
      }
      const result = await mcqModel.getByTopicId(topicId);
      if (!result.success) {
        logger.error(`mcqController.getByTopicId: ${result.error}`);
        return res.status(500).json(result);
      }
      res.json(result);
    } catch (error) {
      const err = error as Error;
      logger.error(`mcqController.getByTopicId: ${err.message}`);
      res.status(500).json({ success: false, error: "Failed to fetch MCQs by topic" });
    }
  },

  async getByTestPaperId(req: Request, res: Response) {
    try {
      const { testPaperId } = req.params;
      if (!testPaperId) {
        return res.status(400).json({ success: false, error: "Test paper ID is required" });
      }
      const result = await mcqModel.getByTestPaperId(testPaperId);
      if (!result.success) {
        logger.error(`mcqController.getByTestPaperId: ${result.error}`);
        return res.status(500).json(result);
      }
      res.json(result);
    } catch (error) {
      const err = error as Error;
      logger.error(`mcqController.getByTestPaperId: ${err.message}`);
      res.status(500).json({ success: false, error: "Failed to fetch MCQs by test paper" });
    }
  },

  async getForTest(req: Request, res: Response) {
    try {
      const { testPaperId } = req.params;
      if (!testPaperId) {
        return res.status(400).json({ success: false, error: "Test paper ID is required" });
      }
      const result = await mcqModel.getForTest(testPaperId);
      if (!result.success) {
        logger.error(`mcqController.getForTest: ${result.error}`);
        return res.status(500).json(result);
      }
      res.json(result);
    } catch (error) {
      const err = error as Error;
      logger.error(`mcqController.getForTest: ${err.message}`);
      res.status(500).json({ success: false, error: "Failed to fetch MCQs for test" });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const mcqData = req.body;
      if (!mcqData?.question || !mcqData?.options || !mcqData?.correctAnswer || !mcqData?.topicId || !mcqData?.testPaperId) {
        return res.status(400).json({ success: false, error: "Missing required fields to create MCQ" });
      }
      const result = await mcqModel.create(mcqData);
      if (!result.success) {
        logger.error(`mcqController.create: ${result.error}`);
        return res.status(500).json(result);
      }
      res.status(201).json(result);
    } catch (error) {
      const err = error as Error;
      logger.error(`mcqController.create: ${err.message}`);
      res.status(500).json({ success: false, error: "Failed to create MCQ" });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const mcqData = req.body;
      if (!id) {
        return res.status(400).json({ success: false, error: "MCQ ID is required" });
      }
      const result = await mcqModel.update(id, mcqData);
      if (!result.success) {
        logger.error(`mcqController.update: ${result.error}`);
        return res.status(500).json(result);
      }
      res.json(result);
    } catch (error) {
      const err = error as Error;
      logger.error(`mcqController.update: ${err.message}`);
      res.status(500).json({ success: false, error: "Failed to update MCQ" });
    }
  },

  async moveToTrash(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ success: false, error: "MCQ ID is required" });
      }
      const result = await mcqModel.moveToTrash(id);
      if (!result.success) {
        logger.error(`mcqController.moveToTrash: ${result.error}`);
        return res.status(500).json(result);
      }
      res.json({ success: true, message: "MCQ moved to trash successfully." });
    } catch (error) {
      const err = error as Error;
      logger.error(`mcqController.moveToTrash: ${err.message}`);
      res.status(500).json({ success: false, error: "Failed to move MCQ to trash" });
    }
  },
};
