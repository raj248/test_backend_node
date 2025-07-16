import express, { Request, Response } from "express";
import admin from "firebase-admin";
import dotenv from "dotenv";
import { logger } from "~/utils/log";

dotenv.config();

const router = express.Router();

// Initialize Firebase Admin SDK once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.PROJECT_ID,
      clientEmail: process.env.CLIENT_EMAIL,
      privateKey: process.env.PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

/**
 * POST /notifications/broadcast
 * Send a test notification to all devices subscribed to the "all-devices" topic
 */
router.post("/broadcast", async (req: Request, res: Response) => {
  const { title, body, data } = req.body as {
    title?: string;
    body?: string;
    data?: Record<string, string>;
  };

  if (!title || !body) {
    return res.status(400).json({
      error: "title and body are required in the request body",
    });
  }

  const message: admin.messaging.Message = {
    topic: "all-devices",
    notification: { title, body },
    data: data || {},
    android: { priority: "high" },
    apns: { headers: { "apns-priority": "10" } },
  };

  try {
    const response = await admin.messaging().send(message);
    logger.log(`✅ Broadcast notification sent: ${response}`);
    res.json({ success: true, response });
  } catch (e: any) {
    logger.error(`❌ Error sending broadcast notification: ${e.message}`);
    res.status(500).json({ success: false, error: e.message });
  }
});

/**
 * GET /notifications/broadcast/test
 * Send a test notification to all devices subscribed to "all-devices"
 */
router.get("/broadcast/test", async (_req: Request, res: Response) => {
  const message: admin.messaging.Message = {
    topic: "all-devices",
    notification: {
      title: "🚀 Test Notification",
      body: "This is a test broadcast to all devices.",
    },
    data: {
      quizId: "test123",
      test: "true",
    },
    android: { priority: "high" },
    apns: { headers: { "apns-priority": "10" } },
  };

  try {
    const response = await admin.messaging().send(message);
    logger.log(`✅ Test broadcast notification sent: ${response}`);
    res.json({
      success: true,
      message: "Test broadcast notification sent to all-devices",
      response,
    });
  } catch (error: any) {
    logger.error(`❌ Error sending test broadcast: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
