import { Request, Response } from "express";
import { TestPaperModel } from "~/models/testpaper.model";

export const TestPaperController = {
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const testPaper = await TestPaperModel.getById(id);
      if (!testPaper) return res.status(404).json({ error: "Test paper not found" });
      res.json(testPaper);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const testPapers = await TestPaperModel.getAll();
      res.json(testPapers);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { name, topicId } = req.body;
      if (!name || !topicId)
        return res.status(400).json({ error: "name and topicId are required" });
      const testPaper = await TestPaperModel.create({ name, topicId });
      res.status(201).json(testPaper);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  async moveToTrash(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await TestPaperModel.moveToTrash(id);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};
