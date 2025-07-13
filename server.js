import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { log, logs } from "./utils/log.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve public folder for debug
app.use(express.static(path.join(process.cwd(), 'public')));

import notificationsRoute from "./routes/notifications.js";
app.use("/notifications", notificationsRoute);

app.get("/status", (req, res) => {
  res.json({
    time: new Date().toLocaleString(),
    env: process.env.NODE_ENV || "development",
    port: process.env.PORT || 3000
  });
});

app.get("/logs", (req, res) => {
  res.json({ logs });
});

app.listen(PORT, () => {
  log(`Server running on port ${PORT}`);
});
