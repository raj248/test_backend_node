import express from "express";
import { TestPaperController } from "~/controllers/testpaper.controller";

const router = express.Router();

router.get("/", TestPaperController.getAll);
router.get("/:id", TestPaperController.getById);
router.get("/test/:id", TestPaperController.getForTest);
router.get('/test/:id/answers', TestPaperController.getTestPaperAnswersController);
router.post("/", TestPaperController.create);
router.put("/:id", TestPaperController.update);
router.delete("/:id", TestPaperController.moveToTrash);

export default router;
