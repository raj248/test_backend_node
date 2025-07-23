import { VideoNoteController } from "~/controllers/videonote.controller";
import express from "express";

const router = express.Router();

router.post("/", VideoNoteController.addVideoNote);
router.get("/", VideoNoteController.getAll);
router.get("/:id", VideoNoteController.getById);
router.get("/topic/:topicId", VideoNoteController.findByTopicId);
router.delete("/:id", VideoNoteController.moveToTrash);

export default router;