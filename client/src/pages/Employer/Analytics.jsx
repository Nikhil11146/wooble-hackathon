import Button from "../../components/Common/Button";
import { EmptyState, ErrorState, LoadingState, PageHeader, StatCard } from "../../components/Common/PageState";
import useApi from "../../hooks/useApi";
import useAuth from "../../hooks/useAuth";
import { getEmployerAnalytics, getEmployerJobs } from "../../services/employer.service";
import { asList, userIdOf } from "../../utils/apiData";
import { formatDate, formatSalary, formatStatus } from "../../utils/format";

function Progress({ label, value }) {
  const safe = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-slate-500">{safe}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100">
        <div className="h-2 rounded-full bg-blue-600" style={{ width: `${safe}%` }} />
      </div>
    </div>
  );
}

export default function EmployerAnalytics() {
  const { user } = useAuth();
  const employerUserId = userIdOf(user);
  const analytics = useApi(() => getEmployerAnalytics(employerUserId), [employerUserId], { immediate: Boolean(employerUserId) });
  const jobs = useApi(() => getEmployerJobs(employerUserId), [employerUserId], { immediate: Boolean(employerUserId) });
  const data = analytics.data || {};
  const jobList = asList(jobs.data);

  return (
    <>
      <PageHeader
        eyebrow="Employer portal"
        title="Recruitment analytics"
        description="Track hiring activity and conversion for your posted jobs."
        action={<Button variant="secondary" onClick={() => { analytics.refetch(); jobs.refetch(); }}>Refresh</Button>}
      />

      {analytics.loading && <LoadingState label="Loading analytics..." />}
      {analytics.error && <ErrorState error={analytics.error} onRetry={analytics.refetch} />}
      {!analytics.loading && !analytics.error && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard label="Total jobs" value={data.totalJobs ?? 0} />
            <StatCard label="Active jobs" value={data.activeJobs ?? 0} />
            <StatCard label="Applicants" value={data.totalApplicants ?? 0} />
            <StatCard label="Interviews" value={data.interviewCount ?? 0} />
            <StatCard label="Hired" value={data.hiredCount ?? 0} />
          </div>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">Conversion</h2>
            <div className="mt-4 max-w-2xl">
              <Progress label="Applications to hires" value={data.conversionRate ?? 0} />
            </div>
          </section>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
            <header className="border-b border-slate-100 p-4">
              <h2 className="text-lg font-bold text-slate-950">Jobs</h2>
            </header>
            {jobs.loading && <div className="p-4"><LoadingState label="Loading jobs..." /></div>}
            {jobs.error && <div className="p-4"><ErrorState error={jobs.error} onRetry={jobs.refetch} /></div>}
            {!jobs.loading && !jobs.error && jobList.length === 0 && (
              <div className="p-4">
                <EmptyState title="No jobs yet" message="Post jobs to see analytics by role." />
              </div>
            )}
            {!jobs.loading && !jobs.error && jobList.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Job</th>
                      <th className="px-4 py-3">Salary</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Positions</th>
                      <th className="px-4 py-3">Posted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {jobList.map((job) => (
                      <tr key={job._id}>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-950">{job.title}</p>
                          <p className="text-xs text-slate-500">{job.category || "General"}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{formatSalary(job.salary)}</td>
                        <td className="px-4 py-3 text-slate-600">{formatStatus(job.status)}</td>
                        <td className="px-4 py-3 text-slate-600">{job.numberOfPositions || 1}</td>
                        <td className="px-4 py-3 text-slate-600">{formatDate(job.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}
