import Message from "../models/Message.js";

const THREADS = (users, jobs) => [
  {
    participants: ["employer@demo.com", "worker@demo.com"],
    job: jobs[0],
    messages: [
      ["employer@demo.com", "Hi Ravi, thanks for applying to the Industrial Electrician role. Your profile looks like a strong fit — can you share your current availability?"],
      ["worker@demo.com", "Hello! Yes, I am available to start immediately and can work full-time."],
      ["employer@demo.com", "That is great to hear. Could you come in for an interview this Friday at 11 AM at our site office?"],
    ],
  },
  {
    participants: ["employer2@demo.com", "worker2@demo.com"],
    job: jobs[1],
    messages: [
      ["employer2@demo.com", "Sita, we have shortlisted you for the Residential Plumber position."],
      ["worker2@demo.com", "Thank you! I would love to join. I mostly work part time, though."],
      ["employer2@demo.com", "Part time works for this role. We will reach out after verification is complete."],
    ],
  },
  {
    participants: ["employer@demo.com", "worker2@demo.com"],
    job: jobs[0],
    messages: [
      ["worker2@demo.com", "Hi, I saw BuildRight is hiring electricians. I am open to that kind of work too."],
      ["employer@demo.com", "Sure Sita, send across your profile and we can review you for both roles."],
    ],
  },
];

export const seedMessages = async (users, jobs) => {
  let inserted = 0;

  await Promise.all(
    THREADS(users, jobs).map(async ({ participants, job, messages }) => {
      const [first, second] = participants.map((email) => users[email]._id);
      await Message.deleteMany({
        $or: [
          { senderId: first, recipientId: second },
          { senderId: second, recipientId: first },
        ],
      });

      for (let index = 0; index < messages.length; index += 1) {
        const [fromEmail, content] = messages[index];
        const sender = users[fromEmail]._id;
        const senderId = sender.equals(first) ? first : second;
        const recipientId = sender.equals(first) ? second : first;
        const read = index < messages.length - 1;

        await Message.create({
          senderId,
          recipientId,
          jobId: job?._id,
          content,
          read,
          ...(read ? {} : { readAt: undefined }),
        });
        inserted += 1;
      }
    }),
  );

  return inserted;
};