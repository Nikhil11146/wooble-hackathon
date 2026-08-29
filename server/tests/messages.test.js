import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { authHeader, loginAndToken, registerUser, startTestServer, stopTestServer, uniqueEmail } from "./helpers/testSetup.js";

let api;
let worker;
let employer;

before(async () => {
  api = await startTestServer();

  worker = await registerUser(api, {
    email: uniqueEmail("msg-worker"),
    password: "StrongPass1!",
    role: "WORKER",
    name: "Alice Worker",
  });

  employer = await registerUser(api, {
    email: uniqueEmail("msg-employer"),
    password: "StrongPass1!",
    role: "EMPLOYER",
    companyName: "Acme Corp",
  });

  worker.token = await loginAndToken(api, { email: worker.user.email, password: "StrongPass1!" });
  employer.token = await loginAndToken(api, { email: employer.user.email, password: "StrongPass1!" });
});

after(async () => {
  await stopTestServer();
});

describe("Messaging - starting new conversations", () => {
  it("requires authentication to search recipients", async () => {
    const res = await api.get("/api/messages/recipients");
    assert.equal(res.status, 401);
  });

  it("lets a worker search employers by name", async () => {
    const res = await api.get("/api/messages/recipients").set(authHeader(worker.token));
    assert.equal(res.status, 200);
    assert.ok(res.body.success);
    assert.ok(res.body.data.some((recipient) => recipient.name === "Acme Corp"));
  });

  it("lets a worker filter recipients by search term", async () => {
    const res = await api.get("/api/messages/recipients").query({ q: "acme" }).set(authHeader(worker.token));
    assert.equal(res.status, 200);
    const names = res.body.data.map((recipient) => recipient.name.toLowerCase());
    assert.ok(names.includes("acme corp"));
  });

  it("does not surface other workers to a worker", async () => {
    const res = await api.get("/api/messages/recipients").set(authHeader(worker.token));
    assert.equal(res.status, 200);
    assert.ok(res.body.data.every((recipient) => recipient.role !== "WORKER"));
  });

  it("lets an employer search workers", async () => {
    const res = await api.get("/api/messages/recipients").set(authHeader(employer.token));
    assert.equal(res.status, 200);
    assert.ok(res.body.data.some((recipient) => recipient.name === "Alice Worker"));
  });

  it("starts a brand-new conversation by sending the first message", async () => {
    const beforeRes = await api.get("/api/messages/conversations").set(authHeader(worker.token));
    assert.ok(!beforeRes.body.data.some((conversation) => String(conversation.otherUser.id) === String(employer.user.id)));

    const sendRes = await api
      .post("/api/messages")
      .set(authHeader(worker.token))
      .send({ recipientId: employer.user.id, content: "Hi, are you hiring?" });
    assert.equal(sendRes.status, 201);

    const workerRes = await api.get("/api/messages/conversations").set(authHeader(worker.token));
    const employerPath = workerRes.body.data.find(
      (conversation) => String(conversation.otherUser.id) === String(employer.user.id),
    );
    assert.ok(employerPath, "new conversation should appear for the sender");
    assert.equal(employerPath.lastMessage.content, "Hi, are you hiring?");

    const employerRes = await api.get("/api/messages/conversations").set(authHeader(employer.token));
    const workerPath = employerRes.body.data.find(
      (conversation) => String(conversation.otherUser.id) === String(worker.user.id),
    );
    assert.ok(workerPath, "new conversation should appear for the recipient");
    assert.equal(workerPath.unreadCount, 1);

    const threadRes = await api.get(`/api/messages/${worker.user.id}`).set(authHeader(employer.token));
    assert.equal(threadRes.status, 200);
    assert.equal(threadRes.body.data.length, 1);
    assert.equal(threadRes.body.data[0].content, "Hi, are you hiring?");
  });
});