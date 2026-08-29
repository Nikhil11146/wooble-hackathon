import Button from "../../components/Common/Button";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "../../components/Common/PageState";
import useApi from "../../hooks/useApi";
import useAuth from "../../hooks/useAuth";
import { getWorkerApplications } from "../../services/worker.service";
import { asList, userIdOf } from "../../utils/apiData";
import { formatDate, formatSalary, formatStatus } from "../../utils/format";

const statusClasses = {
  APPLIED: "bg-blue-50 text-blue-700",
  SHORTLISTED: "bg-amber-50 text-amber-700",
  INTERVIEW: "bg-indigo-50 text-indigo-700",
  HIRED: "bg-green-50 text-green-700",
  REJECTED: "bg-red-50 text-red-700",
};

export default function WorkerApplications() {
  const { user } = useAuth();
  const workerUserId = userIdOf(user);
  const applications = useApi(() => getWorkerApplications(workerUserId), [workerUserId], {
    immediate: Boolean(workerUserId),
  });
  const items = asList(applications.data);

  return (
    <>
      <PageHeader
        eyebrow="Worker portal"
        title="Applications"
        description="Track each job application from applied to hired."
        action={<Button variant="secondary" onClick={applications.refetch}>Refresh</Button>}
      />

      {applications.loading && <LoadingState label="Loading applications..." />}
      {applications.error && <ErrorState error={applications.error} onRetry={applications.refetch} />}
      {!applications.loading && !applications.error && (
        <>
          {items.length === 0 ? (
            <EmptyState title="No applications yet" message="Apply to a matching job to start tracking progress here." />
          ) : (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Job</th>
                      <th className="px-4 py-3">Salary</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Match</th>
                      <th className="px-4 py-3">Applied</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((application) => {
                      const job = application.jobId || {};
                      return (
                        <tr key={application._id}>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-950">{job.title || "Job"}</p>
                            <p className="text-xs text-slate-500">{job.category || "General"}</p>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{formatSalary(job.salary)}</td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[application.status] || "bg-slate-100 text-slate-700"}`}>
                              {formatStatus(application.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{application.matchScore ?? "-"}%</td>
                          <td className="px-4 py-3 text-slate-600">{formatDate(application.appliedAt || application.createdAt)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
