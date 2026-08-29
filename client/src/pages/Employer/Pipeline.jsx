import { useState } from "react";
import Button from "../../components/Common/Button";
import { EmptyState, ErrorState, LoadingState, Notice, PageHeader } from "../../components/Common/PageState";
import useApi from "../../hooks/useApi";
import useAuth from "../../hooks/useAuth";
import { getPipeline, updatePipelineStatus } from "../../services/employer.service";
import { asList, userIdOf } from "../../utils/apiData";
import { formatDate, formatSalary, formatStatus } from "../../utils/format";

const columns = ["APPLIED", "SHORTLISTED", "INTERVIEW", "HIRED", "REJECTED"];

const columnLabels = {
  APPLIED: "New",
  SHORTLISTED: "Shortlisted",
  INTERVIEW: "Interview",
  HIRED: "Hired",
  REJECTED: "Rejected",
};

function workerLabel(application) {
  const worker = application.workerId;
  if (!worker) return "Worker";
  if (typeof worker === "object") return worker.name || worker.email || worker._id;
  return String(worker);
}

export default function EmployerPipeline() {
  const { user } = useAuth();
  const employerUserId = userIdOf(user);
  const pipeline = useApi(() => getPipeline(employerUserId), [employerUserId], { immediate: Boolean(employerUserId) });
  const [movingId, setMovingId] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const moveApplication = async (application, status) => {
    if (application.status === status) return;
    setMovingId(application._id);
    setNotice("");
    setError("");
    try {
      await updatePipelineStatus(employerUserId, application._id, { status });
      await pipeline.refetch();
      setNotice("Pipeline updated.");
    } catch (err) {
      setError(err.message || "Unable to update pipeline.");
    } finally {
      setMovingId("");
    }
  };

  const data = pipeline.data || {};
  const total = columns.reduce((sum, status) => sum + asList(data[status]).length, 0);

  return (
    <>
      <PageHeader
        eyebrow="Employer portal"
        title="Hiring pipeline"
        description="Move candidates from new application through interviews and hiring."
        action={<Button variant="secondary" onClick={pipeline.refetch}>Refresh</Button>}
      />

      <div className="mb-4 grid gap-3">
        {notice && <Notice type="success">{notice}</Notice>}
        {error && <Notice type="error">{error}</Notice>}
      </div>

      {pipeline.loading && <LoadingState label="Loading pipeline..." />}
      {pipeline.error && <ErrorState error={pipeline.error} onRetry={pipeline.refetch} />}
      {!pipeline.loading && !pipeline.error && total === 0 && (
        <EmptyState title="No applications in pipeline" message="Applications and shortlisted candidates will appear here." />
      )}
      {!pipeline.loading && !pipeline.error && total > 0 && (
        <div className="grid gap-4 xl:grid-cols-5">
          {columns.map((status) => (
            <section key={status} className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
                <h2 className="font-bold text-slate-950">{columnLabels[status]}</h2>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                  {asList(data[status]).length}
                </span>
              </header>
              <div className="grid gap-3 p-3">
                {asList(data[status]).map((application) => {
                  const job = application.jobId || {};
                  return (
                    <article key={application._id} className="rounded-lg border border-slate-200 p-3">
                      <p className="font-semibold text-slate-950">{workerLabel(application)}</p>
                      <p className="mt-1 text-sm text-slate-600">{job.title || "Job"}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatSalary(job.salary)}</p>
                      <p className="mt-2 text-xs text-slate-500">Applied {formatDate(application.appliedAt || application.createdAt)}</p>
                      <label className="mt-3 grid gap-1 text-xs font-semibold text-slate-600">
                        Move to
                        <select
                          value={application.status}
                          disabled={movingId === application._id}
                          onChange={(event) => moveApplication(application, event.target.value)}
                          className="min-h-10 rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm font-normal text-slate-900"
                        >
                          {columns.map((nextStatus) => (
                            <option key={nextStatus} value={nextStatus}>
                              {formatStatus(nextStatus)}
                            </option>
                          ))}
                        </select>
                      </label>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
