import { Router } from "express";
import { mcqController } from "~/controllers/mcq.controller";

const router = Router();

// Get All MCQs
router.get("/", mcqController.getAll);

// Get MCQ by ID
router.get("/:id", mcqController.getById);

// Get MCQs by TestPaper ID
router.get("/testpaper/:testPaperId", mcqController.getByTestPaperId);

// Get MCQs by Topic ID
router.get("/topic/:topicId", mcqController.getByTopicId);

// Create MCQ
router.post("/", mcqController.create);

// Update MCQ
router.put("/:id", mcqController.update);

// Soft Delete MCQ
router.delete("/:id", mcqController.moveToTrash);

export default router;
