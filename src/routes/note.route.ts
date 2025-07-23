// src/server/routes/note.route.ts

import express from "express";
import { NoteController, upload } from "~/controllers/note.controller";

const router = express.Router();

// ✅ Upload a note (PDF)
router.post("/upload-note", upload.single("file"), NoteController.uploadNote);

// ✅ Get all notes
router.get("/", NoteController.getAll);

// ✅ Get note by ID
router.get("/:id", NoteController.getById);

// ✅ Get all notes for a topic
router.get("/topic/:topicId", NoteController.findByTopicId);

// ✅ Move note to trash
router.delete("/:id", NoteController.moveToTrash);

export default router;
