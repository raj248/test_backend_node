// src/server/controllers/mcq.controller.ts

import { Request, Response } from "express";
import { mcqModel } from "~/models/mcq.model";

export const mcqController = {
  async getAll(req: Request, res: Response) {
    try {
      const mcqs = await mcqModel.getAll();
      res.json(mcqs);
    } catch (error) {
      console.error("Error fetching MCQs", error);
      res.status(500).json({ error: "Failed to fetch MCQs" });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { mcqId } = req.params;
      const mcq = await mcqModel.getById(mcqId);
      if (!mcq) return res.status(404).json({ error: "MCQ not found" });
      res.json(mcq);
    } catch (error) {
      console.error("Error fetching MCQ", error);
      res.status(500).json({ error: "Failed to fetch MCQ" });
    }
  },

  async getByTopicId(req: Request, res: Response) {
    try {
      const { topicId } = req.params;
      const mcqs = await mcqModel.getByTopicId(topicId);
      res.json(mcqs);
    } catch (error) {
      console.error("Error fetching MCQs by topic", error);
      res.status(500).json({ error: "Failed to fetch MCQs by topic" });
    }
  },

  async getByTestPaperId(req: Request, res: Response) {
    try {
      const { testPaperId } = req.params;
      const mcqs = await mcqModel.getByTestPaperId(testPaperId);
      res.json(mcqs);
    } catch (error) {
      console.error("Error fetching MCQs by test paper", error);
      res.status(500).json({ error: "Failed to fetch MCQs by test paper" });
    }
  },

  async getForTest(req: Request, res: Response) {
    try {
      const { testPaperId } = req.params;
      const mcqs = await mcqModel.getForTest(testPaperId);
      res.json(mcqs);
    } catch (error) {
      console.error("Error fetching MCQs for test", error);
      res.status(500).json({ error: "Failed to fetch MCQs for test" });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const mcqData = req.body;
      const mcq = await mcqModel.create(mcqData);
      res.status(201).json(mcq);
    } catch (error) {
      console.error("Error creating MCQ", error);
      res.status(500).json({ error: "Failed to create MCQ" });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const mcqData = req.body;
      const mcq = await mcqModel.update(id, mcqData);
      res.json(mcq);
    } catch (error) {
      console.error("Error updating MCQ", error);
      res.status(500).json({ error: "Failed to update MCQ" });
    }
  },

  async moveToTrash(req: Request, res: Response) {
    try {
      const { mcqId } = req.params;
      const mcq = await mcqModel.moveToTrash(mcqId);
      res.json(mcq);
    } catch (error) {
      console.error("Error moving MCQ to trash", error);
      res.status(500).json({ error: "Failed to move MCQ to trash" });
    }
  },
};
