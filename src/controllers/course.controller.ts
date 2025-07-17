import { Request, Response } from 'express';
import { CourseModel } from '~/models/course.model';
import { logger } from '~/utils/log';

export const CourseController = {
  async getAll(req: Request, res: Response): Promise<void> {
    const result = await CourseModel.getAll();
    if (!result.success) {
      logger.error(`CourseController.getAll: ${result.error}`);
      res.status(500).json(result);
      return;
    }
    res.json(result);
  },

  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const result = await CourseModel.getById(id);
    if (!result.success) {
      logger.error(`CourseController.getById: ${result.error}`);
      res.status(404).json(result);
      return;
    }
    res.json(result);
  },

  async getTopicsByCourseType(req: Request, res: Response): Promise<void> {
    const { courseType } = req.params;
    if (!["CAInter", "CAFinal"].includes(courseType)) {
      res.status(400).json({ success: false, error: "Invalid courseType" });
      return;
    }

    const result = await CourseModel.getTopicsByCourseType(courseType as "CAInter" | "CAFinal");

    if (!result.success) {
      logger.error(`CourseController.getTopicsByCourseType: ${result.error}`);
      res.status(404).json(result);
      return;
    }

    // Return only the topics for frontend display
    res.json({ success: true, data: result.data?.topics });
  },

  async create(req: Request, res: Response): Promise<void> {
    const { name, courseType } = req.body as {
      name?: string;
      courseType?: 'CAInter' | 'CAFinal';
    };

    if (!name || !courseType) {
      res.status(400).json({ success: false, error: 'name and courseType are required' });
      return;
    }

    const result = await CourseModel.create({ name, courseType });

    if (!result.success) {
      logger.error(`CourseController.create: ${result.error}`);
      res.status(500).json(result);
      return;
    }

    res.status(201).json(result);
  },

  async moveToTrash(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ success: false, error: "Course ID is required." });
      return;
    }

    const result = await CourseModel.moveToTrash(id);

    if (!result.success) {
      logger.error(`CourseController.moveToTrash: ${result.error}`);
      res.status(500).json(result);
      return;
    }

    res.json(result);
  },
};
