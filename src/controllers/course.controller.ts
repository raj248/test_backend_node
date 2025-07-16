// src/controllers/course.controller.ts
import { Request, Response } from 'express';
import { CourseModel } from '~/models/course.model';
import { logger } from '~/utils/log';

export const CourseController = {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const courses = await CourseModel.getAll();
      res.json({ success: true, data: courses });
    } catch (error) {
      const err = error as Error;
      logger.error(`CourseController.getAll: ${err.message}`);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const course = await CourseModel.getById(id);
      if (!course) {
        res.status(404).json({ success: false, error: 'Course not found' });
        return;
      }
      res.json({ success: true, data: course });
    } catch (error) {
      const err = error as Error;
      logger.error(`CourseController.getById: ${err.message}`);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, courseType } = req.body as {
        name?: string;
        courseType?: 'CAInter' | 'CAFinal';
      };

      if (!name || !courseType) {
        res.status(400).json({ success: false, error: 'name and courseType are required' });
        return;
      }

      const course = await CourseModel.create({ name, courseType });
      res.status(201).json({ success: true, data: course });
    } catch (error) {
      const err = error as Error;
      logger.error(`CourseController.create: ${err.message}`);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async softDelete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await CourseModel.softDelete(id);
      res.json({ success: true, message: 'Course moved to trash' });
    } catch (error) {
      const err = error as Error;
      logger.error(`CourseController.softDelete: ${err.message}`);
      res.status(500).json({ success: false, error: err.message });
    }
  },
};
