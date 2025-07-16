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

app.get("/status", (req, res) => res.json({
  time: new Date().toLocaleString(),
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 3000
}));
app.get("/logs", (req, res) => res.json(logger.logs));
app.use("/notifications", notificationsRoute);
app.use("/courses", courseRoute)
app.listen(PORT, () => {
  logger.log(`Server running on port ${PORT}`);
});
