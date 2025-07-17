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

  async fetchTestPaperByTopicId(req: Request, res: Response) {
    try {
      const { topicId } = req.params;
      const testPapers = await TopicModel.fetchTestPaperByTopicId(topicId);
      res.json(testPapers);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to fetch test papers' });
    }
  }
};
