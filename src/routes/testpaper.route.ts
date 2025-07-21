import express from "express";
import { TestPaperController } from "~/controllers/testpaper.controller";

const router = express.Router();

router.get("/", TestPaperController.getAll);
router.get("/:id", TestPaperController.getById);
router.get("/test/:testPaperId", TestPaperController.getForTest);
router.post("/", TestPaperController.create);
router.put("/:id", TestPaperController.update);
router.delete("/:id", TestPaperController.moveToTrash);

export default router;
