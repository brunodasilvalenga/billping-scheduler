const { Queue } = require('bullmq');
const emailQueue = new Queue('emailQueue', process.env.REDIS_URL);

// This will be executed by Bree
module.exports = async (job) => {
  const { users } = job.data ; // Get users from job data

  for (const user of users) {
    await emailQueue.add({
      userId: user.id,
      email: user.email,
      digestType: user.digestFrequency,
    });
  }

  console.log(`Queued emails for ${users.length} users in timezone: ${users[0].timezone}`);
};