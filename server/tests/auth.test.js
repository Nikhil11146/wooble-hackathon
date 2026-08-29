import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { loginAndToken, registerUser, startTestServer, stopTestServer, uniqueEmail } from "./helpers/testSetup.js";

let api;

before(async () => {
  api = await startTestServer();
});

after(async () => {
  await stopTestServer();
});

describe("Authentication", () => {
  it("registers a worker and returns a session", async () => {
    const session = await registerUser(api, {
      email: uniqueEmail("worker"),
      password: "StrongPass1!",
      role: "WORKER",
      name: "Test Worker",
    });
    assert.ok(session.token, "expected an access token");
    assert.ok(session.refreshToken, "expected a refresh token");
    assert.equal(session.user.role, "WORKER");
  });

  it("registers an employer with a company profile", async () => {
    const session = await registerUser(api, {
      email: uniqueEmail("employer"),
      password: "StrongPass1!",
      role: "EMPLOYER",
      companyName: "Acme Corp",
    });
    assert.equal(session.user.role, "EMPLOYER");
    assert.ok(session.profile, "expected an employer profile");
    assert.equal(session.profile.companyName, "Acme Corp");
  });

  it("rejects a weak password during registration", async () => {
    const res = await api.post("/api/auth/register").send({
      email: uniqueEmail("weak"),
      password: "short",
      role: "WORKER",
    });
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  it("rejects a password missing complexity requirements", async () => {
    const res = await api.post("/api/auth/register").send({
      email: uniqueEmail("nolower"),
      password: "ALLUPPERCASE1",
      role: "WORKER",
    });
    assert.equal(res.status, 400);
    assert.match(res.body.message, /lowercase/i);
  });

  it("rejects duplicate email registration", async () => {
    const email = uniqueEmail("dup");
    await registerUser(api, { email, password: "StrongPass1!", role: "WORKER" });
    const res = await api.post("/api/auth/register").send({ email, password: "StrongPass1!", role: "WORKER" });
    assert.equal(res.status, 409);
  });

  it("logs in with valid credentials", async () => {
    const email = uniqueEmail("login");
    await registerUser(api, { email, password: "StrongPass1!", role: "WORKER" });
    const token = await loginAndToken(api, { email, password: "StrongPass1!" });
    assert.ok(token);
  });

  it("rejects login with a wrong password", async () => {
    const email = uniqueEmail("badpw");
    await registerUser(api, { email, password: "StrongPass1!", role: "WORKER" });
    const res = await api.post("/api/auth/login").send({ email, password: "WrongPass1!" });
    assert.equal(res.status, 401);
  });

  it("rejects register with an invalid role", async () => {
    const res = await api.post("/api/auth/register").send({
      email: uniqueEmail("badrole"),
      password: "StrongPass1!",
      role: "SUPERUSER",
    });
    assert.equal(res.status, 400);
  });

  it("rejects register missing fields via validation middleware", async () => {
    const res = await api.post("/api/auth/register").send({ email: uniqueEmail("missing") });
    assert.equal(res.status, 400);
    assert.ok(Array.isArray(res.body.errors));
  });

  it("rate limits authentication routes", async () => {
    const email = uniqueEmail("ratelimit");
    for (let i = 0; i < 5; i += 1) {
      await api.post("/api/auth/login").send({ email, password: "WrongPass1!" });
    }
    // Exhaust the limiter beyond its max (20 per 15 min shared across register/login/refresh).
    for (let i = 0; i < 25; i += 1) {
      await api.post("/api/auth/login").send({ email: uniqueEmail("rl"), password: "WrongPass1!" });
    }
    const res = await api.post("/api/auth/login").send({ email: uniqueEmail("rl"), password: "WrongPass1!" });
    assert.equal(res.status, 429);
  });
});
