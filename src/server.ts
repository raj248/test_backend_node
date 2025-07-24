import 'dotenv/config';

import express from "express";
import cors from "cors";
import path from "path";
import { logger } from "~/utils/log";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve public folder for debug
app.use(express.static(path.join(process.cwd(), 'public')));

import notificationsRoute from "~/routes/notifications.routes";
import courseRoute from "~/routes/course.routes";
import topicRoutes from '~/routes/topic.routes';
import testPaperRoutes from "~/routes/testpaper.routes";
import mcqRoutes from "~/routes/mcq.routes";
import trashRoutes from "~/routes/trash.routes";
import noteRoutes from "~/routes/note.routes";
import videoNoteRoutes from "~/routes/videonote.routes";

import { logResponseBody } from "~/middleware/logResponseBody";

app.use(logResponseBody);

app.get("/status", (req, res) => res.json({
  time: new Date().toLocaleString(),
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 3000
}));
app.get("/logs", (req, res) => res.json(logger.logs));
app.use("/notifications", notificationsRoute);
app.use("/api/courses", courseRoute)
app.use('/api/topics', topicRoutes);
app.use('/api/testpapers', testPaperRoutes);
app.use("/api/trash", trashRoutes);
app.use("/api/mcqs", mcqRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/videonotes", videoNoteRoutes)

// Serve uploaded files statically if needed:
app.use('/uploads', express.static('uploads'));

// Handle unknown routes
app.use((req, res) => {
  logger.warn(`Unknown route accessed: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.originalUrl,
    method: req.method,
  });
});

app.listen(PORT, () => {
  logger.log(`Server running on port ${PORT}`);
});
