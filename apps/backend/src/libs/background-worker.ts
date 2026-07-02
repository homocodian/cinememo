import { Queue, Worker } from "bullmq";

import { saveDevice } from "./background/save-device";
import { sendVerificationCode } from "./background/send-verification-code";
import { updateSessionLastUsedAt } from "./background/update-session-last-used";
import { redisClient } from "./redis-connection";

export const BgQueue = new Queue("cinememo-bgTask", {
  connection: redisClient,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: true,
    attempts: 2,
    backoff: {
      type: "exponential",
      delay: 4000
    }
  }
});

const BgWorker = new Worker(
  "cinememo-bgTask",
  async (job) => {
    switch (job.name) {
      case "saveDevice":
        await saveDevice(job.data);
        break;

      case "sendVerificationCode":
        await sendVerificationCode(job.data);
        break;

      case "updateSessionLastUsedAt":
        await updateSessionLastUsedAt(job.data);
        break;

      default:
        console.error(`Unknown job type: ${job.name}`);
    }
  },
  {
    connection: redisClient
  }
);

BgWorker.on("completed", (job) => {
  console.log(`Task ${job.id} (${job.name}) has been completed`);
});

BgWorker.on("failed", (job, err) => {
  console.error(`Task ${job?.id} has failed: ${err.message}`);
});
