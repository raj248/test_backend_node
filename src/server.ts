import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { logger } from "~/utils/log";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve public folder for debug
app.use(express.static(path.join(process.cwd(), 'public')));

import notificationsRoute from "~/routes/notifications";
import courseRoute from "~/routes/course.route";
import topicRoutes from '~/routes/topic.route';
import testPaperRoutes from "~/routes/testpaper.route";

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
