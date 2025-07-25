import express from "express";
import { newlyAddedController } from "~/controllers/newlyadded.controller";

const router = express.Router();

// List all newly added items
router.get("/", newlyAddedController.list);

// Add a new item to newly added
router.post("/", newlyAddedController.add);

// Remove an item from newly added by ID
router.delete("/:id", newlyAddedController.remove);

export default router;
