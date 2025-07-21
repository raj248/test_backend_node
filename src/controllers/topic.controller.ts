import { Request, Response } from 'express';
import { TopicModel } from '~/models/topic.model';

export const TopicController = {
  async fetchTopicById(req: Request, res: Response) {
    try {
      const { topicId } = req.params;
      const topic = await TopicModel.fetchTopicById(topicId);
      res.json(topic);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to fetch topic' });
    }
  },

  async fetchTestPapersByTopicId(req: Request, res: Response) {
    try {
      const { topicId } = req.params;
      const testPapers = await TopicModel.fetchTestPapersByTopicId(topicId);
      res.json(testPapers);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to fetch test papers' });
    }
  },

  async create(req: Request, res: Response) {
    const { name, description, courseType } = req.body;

    const result = await TopicModel.create({
      name,
      description,
      courseType,
    });

    if (result.success) {
      return res.status(201).json(result);
    } else {
      return res.status(400).json(result);
    }
  },

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { name, description, courseType } = req.body;

    const result = await TopicModel.update(id, { name, description, courseType });

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  },

  async moveTopicToTrash(req: Request, res: Response) {
    const { topicId } = req.params;
    const topic = await TopicModel.moveToTrash(topicId);
    if (!topic) {
      res.status(404).json({ message: 'Topic not found' });
    }
    res.json(topic);
  }

};
