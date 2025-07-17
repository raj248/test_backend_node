import express from 'express';
import { TopicController } from '~/controllers/topic.controller';

const router = express.Router();

// GET /topics/:topicId - get a specific topic
router.get('/:topicId', TopicController.fetchTopicById);

// GET /topics/:topicId/testpapers -get all testpaper by topic id
router.get('/:topicId/testpapers', TopicController.fetchTestPaperByTopicId);

// POST
router.post('/:topicId/move-to-trash', TopicController.moveTopicToTrash)
export default router;
