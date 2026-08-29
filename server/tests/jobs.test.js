import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { authHeader, registerUser, startTestServer, stopTestServer, uniqueEmail } from "./helpers/testSetup.js";

let api;
let employer;

before(async () => {
  api = await startTestServer();
  employer = await registerUser(api, { email: uniqueEmail("jobs-employer"), password: "StrongPass1!", role: "EMPLOYER", companyName: "Jobs Corp" });
});

after(async () => {
  await stopTestServer();
});

describe("Jobs", () => {
  it("creates a job (employer)", async () => {
    const res = await api
      .post(`/api/employers/${employer.user.id}/jobs`)
      .set(authHeader(employer.token))
      .send({
        title: "Plumber",
        description: "Fix pipes",
        category: "CONSTRUCTION",
        employmentType: "FULL_TIME",
        salary: { min: 30000, max: 50000 },
      });
    assert.equal(res.status, 201);
    assert.equal(res.body.data.title, "Plumber");
    assert.equal(res.body.data.employerId, employer.user.id);
  });

  it("returns the employer's jobs", async () => {
    const res = await api
      .get(`/api/employers/${employer.user.id}/jobs`)
      .set(authHeader(employer.token));
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.data));
  });

  it("updates a job the employer owns", async () => {
    const created = await api
      .post(`/api/employers/${employer.user.id}/jobs`)
      .set(authHeader(employer.token))
      .send({ title: "Electrician", description: "Wiring" });
    const jobId = created.body.data._id;

    const res = await api
      .put(`/api/employers/${employer.user.id}/jobs/${jobId}`)
      .set(authHeader(employer.token))
      .send({ description: "Wiring updated" });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.description, "Wiring updated");
  });

  it("closes a job (soft delete) the employer owns", async () => {
    const created = await api
      .post(`/api/employers/${employer.user.id}/jobs`)
      .set(authHeader(employer.token))
      .send({ title: "Mason", description: "Bricklaying" });
    const jobId = created.body.data._id;

    const res = await api
      .delete(`/api/employers/${employer.user.id}/jobs/${jobId}`)
      .set(authHeader(employer.token));
    assert.equal(res.status, 200);

    const job = await api.get(`/api/jobs/${jobId}`);
    assert.equal(job.body.data.status, "CLOSED");
  });

  it("lists open jobs via the public jobs endpoint", async () => {
    const res = await api.get("/api/jobs/search");
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.data));
  });

  it("returns 404 for a missing job", async () => {
    const res = await api.get("/api/jobs/000000000000000000000000");
    assert.equal(res.status, 404);
  });
});
