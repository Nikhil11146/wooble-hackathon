import { useMemo, useState } from "react";
import Button from "../../components/Common/Button";
import Input from "../../components/Common/Input";
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
  const [query, setQuery] = useState("");
  const data = stats.data || {};

  const term = query.trim().toLowerCase();

  const filteredWorkers = useMemo(() => {
    const list = asList(workers.data);
    if (!term) return list;
    return list.filter((worker) =>
      [worker.name, worker.primaryOccupation, worker.userId?.email]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(term)),
    );
  }, [term, workers.data]);

  const filteredEmployers = useMemo(() => {
    const list = asList(employers.data);
    if (!term) return list;
    return list.filter((employer) =>
      [employer.companyName, employer.userId?.email, employer.industry]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(term)),
    );
  }, [term, employers.data]);

  const filteredJobs = useMemo(() => {
    const list = asList(jobs.data);
    if (!term) return list;
    return list.filter((job) =>
      [job.title, job.category, job.status]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(term)),
    );
  }, [term, jobs.data]);

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

      <Input
        type="search"
        placeholder="Search workers, employers, or jobs..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="mb-6"
        aria-label="Search platform stats"
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

      <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm dark:border-[#222d34] dark:bg-[#202c33] dark:shadow-black/25 dark:backdrop-blur">
        <header className="border-b border-slate-100 p-4 dark:border-[#222d34]">
          <h2 className="text-xl font-bold tracking-tight text-slate-950 dark:text-[#e9edef]">Workers</h2>
        </header>
        {workers.loading && <div className="p-4"><LoadingState label="Loading workers..." /></div>}
        {workers.error && <div className="p-4"><ErrorState error={workers.error} onRetry={workers.refetch} /></div>}
        {!workers.loading && !workers.error && filteredWorkers.length === 0 && (
          <div className="p-4"><EmptyState title={term ? "No matching workers" : "No workers"} /></div>
        )}
        {!workers.loading && !workers.error && filteredWorkers.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-700">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-[#2a3942] dark:text-[#8696a0]">
                <tr>
                  <th className="px-4 py-3">Worker</th>
                  <th className="px-4 py-3">Occupation</th>
                  <th className="px-4 py-3">Trust</th>
                  <th className="px-4 py-3">Experience</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredWorkers.slice(0, 8).map((worker) => (
                  <tr key={worker._id}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-950 dark:text-[#e9edef]">{worker.name}</p>
                      <p className="text-xs text-slate-500 dark:text-[#8696a0]">{worker.userId?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-[#aebac1]">{worker.primaryOccupation || "Not set"}</td>
                    <td className="px-4 py-3">
                      <TrustScore score={worker.kaushalTrustScore} size={42} showLabel={false} />
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-[#aebac1]">{worker.yearsOfExperience || 0} years</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-[#aebac1]">{formatDate(worker.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-[#222d34] dark:bg-[#202c33] dark:shadow-black/25 dark:backdrop-blur">
          <header className="border-b border-slate-100 p-4 dark:border-[#222d34]">
            <h2 className="text-xl font-bold tracking-tight text-slate-950 dark:text-[#e9edef]">Employers</h2>
          </header>
          {employers.loading && <div className="p-4"><LoadingState label="Loading employers..." /></div>}
          {employers.error && <div className="p-4"><ErrorState error={employers.error} onRetry={employers.refetch} /></div>}
          {!employers.loading && !employers.error && (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredEmployers.slice(0, 8).map((employer) => (
                <div key={employer._id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-semibold text-slate-950 dark:text-[#e9edef]">{employer.companyName}</p>
                    <p className="text-sm text-slate-500 dark:text-[#8696a0]">{employer.userId?.email || employer.industry || "Employer"}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-[#2a3942] dark:text-[#aebac1]">
                    {employer.verified ? "Verified" : "Pending"}
                  </span>
                </div>
              ))}
              {filteredEmployers.length === 0 && <div className="p-4"><EmptyState title={term ? "No matching employers" : "No employers"} /></div>}
            </div>
          )}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-[#222d34] dark:bg-[#202c33] dark:shadow-black/25 dark:backdrop-blur">
          <header className="border-b border-slate-100 p-4 dark:border-[#222d34]">
            <h2 className="text-xl font-bold tracking-tight text-slate-950 dark:text-[#e9edef]">Jobs</h2>
          </header>
          {jobs.loading && <div className="p-4"><LoadingState label="Loading jobs..." /></div>}
          {jobs.error && <div className="p-4"><ErrorState error={jobs.error} onRetry={jobs.refetch} /></div>}
          {!jobs.loading && !jobs.error && (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredJobs.slice(0, 8).map((job) => (
                <div key={job._id} className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-semibold text-slate-950 dark:text-[#e9edef]">{job.title}</p>
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-[#00a884]/15 dark:text-[#00a884]">
                      {formatStatus(job.status)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500 dark:text-[#8696a0]">{job.category || "General"} - {formatSalary(job.salary)}</p>
                </div>
              ))}
              {filteredJobs.length === 0 && <div className="p-4"><EmptyState title={term ? "No matching jobs" : "No jobs"} /></div>}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
