import express from "express";
import { TestPaperController } from "~/controllers/testpaper.controller";

const router = express.Router();

router.get("/", TestPaperController.getAll);
router.get("/:id", TestPaperController.getById);
router.post("/", TestPaperController.create);
router.delete("/:id", TestPaperController.moveToTrash);

export default router;
