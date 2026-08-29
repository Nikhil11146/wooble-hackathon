import { useState } from "react";
import Button from "../../components/Common/Button";
import { EmptyState, ErrorState, LoadingState, Notice, PageHeader } from "../../components/Common/PageState";
import JobCard from "../../components/Cards/JobCard";
import JobForm from "../../components/Forms/JobForm";
import useApi from "../../hooks/useApi";
import useAuth from "../../hooks/useAuth";
import { createJob, deleteJob, getEmployerJobs } from "../../services/employer.service";
import { asList, userIdOf } from "../../utils/apiData";
import { formatDate } from "../../utils/format";

export default function EmployerPostJob() {
  const { user } = useAuth();
  const employerUserId = userIdOf(user);
  const jobs = useApi(() => getEmployerJobs(employerUserId), [employerUserId], { immediate: Boolean(employerUserId) });
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [formKey, setFormKey] = useState(0);

  const postJob = async (payload) => {
    setSaving(true);
    setNotice("");
    setError("");
    try {
      const job = await createJob(employerUserId, payload);
      jobs.setData([job, ...asList(jobs.data)]);
      setFormKey((value) => value + 1);
      setNotice("Job posted.");
    } catch (err) {
      setError(err.message || "Unable to post job.");
    } finally {
      setSaving(false);
    }
  };

  const closeJob = async (job) => {
    if (!window.confirm(`Close ${job.title}?`)) return;
    setNotice("");
    setError("");
    try {
      await deleteJob(employerUserId, job._id);
      jobs.setData(asList(jobs.data).map((item) => (item._id === job._id ? { ...item, status: "CLOSED" } : item)));
      setNotice("Job closed.");
    } catch (err) {
      setError(err.message || "Unable to close job.");
    }
  };

  const jobList = asList(jobs.data);

  return (
    <>
      <PageHeader
        eyebrow="Employer portal"
        title="Post and manage jobs"
        description="Create openings and keep closed roles out of worker search."
      />

      <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">New job</h2>
          <div className="mt-4">
            <JobForm key={formKey} onSubmit={postJob} submitting={saving} />
          </div>
        </section>

        <section>
          <div className="mb-4 grid gap-3">
            {notice && <Notice type="success">{notice}</Notice>}
            {error && <Notice type="error">{error}</Notice>}
          </div>
          {jobs.loading && <LoadingState label="Loading jobs..." />}
          {jobs.error && <ErrorState error={jobs.error} onRetry={jobs.refetch} />}
          {!jobs.loading && !jobs.error && (
            <div className="grid gap-4">
              {jobList.length > 0 ? (
                jobList.map((job) => (
                  <div key={job._id} className="grid gap-2">
                    <JobCard job={job} />
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
                      <span className="text-slate-500">Posted {formatDate(job.createdAt)}</span>
                      <Button variant="secondary" className="min-h-10 px-3" disabled={job.status === "CLOSED"} onClick={() => closeJob(job)}>
                        {job.status === "CLOSED" ? "Closed" : "Close job"}
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState title="No jobs posted" message="Post your first opening to begin receiving candidates." />
              )}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
