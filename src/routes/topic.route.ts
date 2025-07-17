import express from 'express';
import { TopicController } from '~/controllers/topic.controller';

const router = express.Router();

// GET /topics/:topicId - get a specific topic
router.get('/:topicId', TopicController.fetchTopicById);

// GET /topics/:topicId/testpapers -get all testpaper by topic id
router.get('/:topicId/testpapers', TopicController.fetchTestPaperByTopicId);

export default router;
