import cron, { ScheduledTask } from "node-cron";
import fs from "fs-extra";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const JOBS_FILE_PATH = path.resolve(__dirname, "scheduled_jobs.json");

interface ScheduledJob {
  id: string; // unique for managing cancellation if needed
  testPaperId: string;
  scheduledPublishAt: string; // ISO string
  cronExpression: string;
}

const activeJobs: Record<string, ScheduledTask> = {};

/**
 * Load jobs from file on startup and reschedule them.
 */
export async function loadScheduledJobs(onExecute: (testPaperId: string) => Promise<void>) {
  if (!(await fs.pathExists(JOBS_FILE_PATH))) {
    await fs.writeJson(JOBS_FILE_PATH, []);
    return;
  }

  const jobs: ScheduledJob[] = await fs.readJson(JOBS_FILE_PATH);

  for (const job of jobs) {
    if (new Date(job.scheduledPublishAt) <= new Date()) {
      // Missed during downtime, execute immediately
      await onExecute(job.testPaperId);
      await removeScheduledJob(job.id);
    } else {
      scheduleJob(job, onExecute);
    }
  }
}

/**
 * Schedule a new job and persist it.
 */
export async function addScheduledJob(
  testPaperId: string,
  scheduledPublishAt: Date,
  onExecute: (testPaperId: string) => Promise<void>
) {
  const cronExpression = dateToCronExpression(scheduledPublishAt);

  const job: ScheduledJob = {
    id: uuidv4(),
    testPaperId,
    scheduledPublishAt: scheduledPublishAt.toISOString(),
    cronExpression,
  };

  await persistJob(job);
  scheduleJob(job, onExecute);
}

/**
 * Schedule and track a single job.
 */
function scheduleJob(job: ScheduledJob, onExecute: (testPaperId: string) => Promise<void>) {
  const task = cron.schedule(job.cronExpression, async () => {
    try {
      await onExecute(job.testPaperId);
    } catch (error) {
      console.error(`Error executing job ${job.id}:`, error);
    } finally {
      task.stop();
      delete activeJobs[job.id];
      await removeScheduledJob(job.id);
    }
  });

  activeJobs[job.id] = task;
}

/**
 * Remove a scheduled job by ID from JSON file and stop the task if active.
 */
export async function removeScheduledJob(jobId: string) {
  const jobs: ScheduledJob[] = await fs.readJson(JOBS_FILE_PATH);
  const updatedJobs = jobs.filter((j) => j.id !== jobId);
  await fs.writeJson(JOBS_FILE_PATH, updatedJobs, { spaces: 2 });

  if (activeJobs[jobId]) {
    activeJobs[jobId].stop();
    delete activeJobs[jobId];
  }
}

/**
 * Persist a new job to the JSON file.
 */
async function persistJob(job: ScheduledJob) {
  const jobs: ScheduledJob[] = (await fs.readJson(JOBS_FILE_PATH).catch(() => [])) || [];
  jobs.push(job);
  await fs.writeJson(JOBS_FILE_PATH, jobs, { spaces: 2 });
}

/**
 * Converts a Date to a cron expression for that exact minute.
 */
function dateToCronExpression(date: Date): string {
  const min = date.getUTCMinutes();
  const hour = date.getUTCHours();
  const day = date.getUTCDate();
  const month = date.getUTCMonth() + 1; // JS months are 0-based
  const dow = "*";
  return `${min} ${hour} ${day} ${month} ${dow}`;
}
