import express from "express";
import { trashController } from "~/controllers/trash.controller";

const router = express.Router();

router.get("/", trashController.list);
router.delete("/:id", trashController.delete);
router.delete("/", trashController.purge);
router.post("/:id/restore", trashController.restore);

export default router;
