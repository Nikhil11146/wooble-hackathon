import Button from "../../components/Common/Button";
import { EmptyState, ErrorState, LoadingState, PageHeader, StatCard } from "../../components/Common/PageState";
import TrustScore from "../../components/Common/TrustScore";
import useApi from "../../hooks/useApi";
import { getAllEmployers, getAllJobs, getAllWorkers, getPlatformStats } from "../../services/admin.service";
import { asList } from "../../utils/apiData";
import { formatDate, formatSalary, formatStatus } from "../../utils/format";

export default function AdminPlatformStats() {
  const stats = useApi(getPlatformStats, [], { immediate: true });
  const workers = useApi(getAllWorkers, [], { immediate: true });
  const employers = useApi(getAllEmployers, [], { immediate: true });
  const jobs = useApi(getAllJobs, [], { immediate: true });
  const data = stats.data || {};

  const refreshAll = () => {
    stats.refetch();
    workers.refetch();
    employers.refetch();
    jobs.refetch();
  };

  return (
    <>
      <PageHeader
        eyebrow="Admin portal"
        title="Platform stats"
        description="High-level platform health with recent workers, employers, and jobs."
        action={<Button variant="secondary" onClick={refreshAll}>Refresh</Button>}
      />

      {stats.loading && <LoadingState label="Loading stats..." />}
      {stats.error && <ErrorState error={stats.error} onRetry={stats.refetch} />}
      {!stats.loading && !stats.error && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Workers" value={data.totalWorkers ?? 0} />
          <StatCard label="Employers" value={data.totalEmployers ?? 0} />
          <StatCard label="Active jobs" value={data.activeJobs ?? 0} />
          <StatCard label="Successful hires" value={data.successfulHires ?? 0} />
        </div>
      )}

      <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
        <header className="border-b border-slate-100 p-4">
          <h2 className="text-lg font-bold text-slate-950">Workers</h2>
        </header>
        {workers.loading && <div className="p-4"><LoadingState label="Loading workers..." /></div>}
        {workers.error && <div className="p-4"><ErrorState error={workers.error} onRetry={workers.refetch} /></div>}
        {!workers.loading && !workers.error && asList(workers.data).length === 0 && (
          <div className="p-4"><EmptyState title="No workers" /></div>
        )}
        {!workers.loading && !workers.error && asList(workers.data).length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Worker</th>
                  <th className="px-4 py-3">Occupation</th>
                  <th className="px-4 py-3">Trust</th>
                  <th className="px-4 py-3">Experience</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {asList(workers.data).slice(0, 8).map((worker) => (
                  <tr key={worker._id}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-950">{worker.name}</p>
                      <p className="text-xs text-slate-500">{worker.userId?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{worker.primaryOccupation || "Not set"}</td>
                    <td className="px-4 py-3">
                      <TrustScore score={worker.kaushalTrustScore} size={42} showLabel={false} />
                    </td>
                    <td className="px-4 py-3 text-slate-600">{worker.yearsOfExperience || 0} years</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(worker.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <header className="border-b border-slate-100 p-4">
            <h2 className="text-lg font-bold text-slate-950">Employers</h2>
          </header>
          {employers.loading && <div className="p-4"><LoadingState label="Loading employers..." /></div>}
          {employers.error && <div className="p-4"><ErrorState error={employers.error} onRetry={employers.refetch} /></div>}
          {!employers.loading && !employers.error && (
            <div className="divide-y divide-slate-100">
              {asList(employers.data).slice(0, 8).map((employer) => (
                <div key={employer._id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-semibold text-slate-950">{employer.companyName}</p>
                    <p className="text-sm text-slate-500">{employer.userId?.email || employer.industry || "Employer"}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                    {employer.verified ? "Verified" : "Pending"}
                  </span>
                </div>
              ))}
              {asList(employers.data).length === 0 && <div className="p-4"><EmptyState title="No employers" /></div>}
            </div>
          )}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <header className="border-b border-slate-100 p-4">
            <h2 className="text-lg font-bold text-slate-950">Jobs</h2>
          </header>
          {jobs.loading && <div className="p-4"><LoadingState label="Loading jobs..." /></div>}
          {jobs.error && <div className="p-4"><ErrorState error={jobs.error} onRetry={jobs.refetch} /></div>}
          {!jobs.loading && !jobs.error && (
            <div className="divide-y divide-slate-100">
              {asList(jobs.data).slice(0, 8).map((job) => (
                <div key={job._id} className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-semibold text-slate-950">{job.title}</p>
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                      {formatStatus(job.status)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{job.category || "General"} - {formatSalary(job.salary)}</p>
                </div>
              ))}
              {asList(jobs.data).length === 0 && <div className="p-4"><EmptyState title="No jobs" /></div>}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
