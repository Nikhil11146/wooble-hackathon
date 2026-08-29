import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { authHeader, registerUser, startTestServer, stopTestServer, uniqueEmail } from "./helpers/testSetup.js";

let api;
let workerA;
let workerB;
let employerA;
let employerB;

before(async () => {
  api = await startTestServer();

  workerA = await registerUser(api, { email: uniqueEmail("wA"), password: "StrongPass1!", role: "WORKER", name: "Worker A" });
  workerB = await registerUser(api, { email: uniqueEmail("wB"), password: "StrongPass1!", role: "WORKER", name: "Worker B" });
  employerA = await registerUser(api, { email: uniqueEmail("eA"), password: "StrongPass1!", role: "EMPLOYER", companyName: "Employer A" });
  employerB = await registerUser(api, { email: uniqueEmail("eB"), password: "StrongPass1!", role: "EMPLOYER", companyName: "Employer B" });
});

after(async () => {
  await stopTestServer();
});

describe("Profile ownership checks", () => {
  it("allows a worker to update their own profile", async () => {
    const res = await api
      .put(`/api/workers/${workerA.user.id}`)
      .set(authHeader(workerA.token))
      .send({ yearsOfExperience: 5 });
    assert.equal(res.status, 200);
  });

  it("forbids a worker from updating another worker's profile (403)", async () => {
    const res = await api
      .put(`/api/workers/${workerB.user.id}`)
      .set(authHeader(workerA.token))
      .send({ yearsOfExperience: 5 });
    assert.equal(res.status, 403);
  });

  it("allows a worker to add a skill to their own profile", async () => {
    const res = await api
      .post(`/api/workers/${workerA.user.id}/skills`)
      .set(authHeader(workerA.token))
      .send({ name: "Carpentry" });
    assert.equal(res.status, 201);
  });

  it("forbids a worker from adding a skill to another worker's profile (403)", async () => {
    const res = await api
      .post(`/api/workers/${workerB.user.id}/skills`)
      .set(authHeader(workerA.token))
      .send({ name: "Carpentry" });
    assert.equal(res.status, 403);
  });

  it("allows a worker to read their own applications", async () => {
    const res = await api
      .get(`/api/workers/${workerA.user.id}/applications`)
      .set(authHeader(workerA.token));
    assert.equal(res.status, 200);
  });

  it("forbids a worker from reading another worker's applications (403)", async () => {
    const res = await api
      .get(`/api/workers/${workerB.user.id}/applications`)
      .set(authHeader(workerA.token));
    assert.equal(res.status, 403);
  });

  it("allows an employer to update their own profile", async () => {
    const res = await api
      .put(`/api/employers/${employerA.user.id}`)
      .set(authHeader(employerA.token))
      .send({ industry: "Construction" });
    assert.equal(res.status, 200);
  });

  it("forbids an employer from updating another employer's profile (403)", async () => {
    const res = await api
      .put(`/api/employers/${employerB.user.id}`)
      .set(authHeader(employerA.token))
      .send({ industry: "Construction" });
    assert.equal(res.status, 403);
  });

  it("allows an employer to post a job to their own account", async () => {
    const res = await api
      .post(`/api/employers/${employerA.user.id}/jobs`)
      .set(authHeader(employerA.token))
      .send({ title: "Carpenter needed", description: "2 week contract" });
    assert.equal(res.status, 201);
  });

  it("forbids an employer from posting a job to another employer's account (403)", async () => {
    const res = await api
      .post(`/api/employers/${employerB.user.id}/jobs`)
      .set(authHeader(employerA.token))
      .send({ title: "Intruder job", description: "should be blocked" });
    assert.equal(res.status, 403);
  });
});
