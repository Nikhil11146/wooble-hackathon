import Button from "../../components/Common/Button";
import { ErrorState, LoadingState, PageHeader, StatCard } from "../../components/Common/PageState";
import TrustScore from "../../components/Common/TrustScore";
import JobCard from "../../components/Cards/JobCard";
import useApi from "../../hooks/useApi";
import useAuth from "../../hooks/useAuth";
import { getRecommendedJobs, getTrustScore, getWorkerApplications } from "../../services/worker.service";
import { asList, profileIdOf, userIdOf } from "../../utils/apiData";
import { AVAILABILITY_LABELS } from "../../utils/constants";
import { formatDate, formatSalary, formatStatus } from "../../utils/format";

export default function WorkerDashboard({ onNavigate }) {
  const { user, profile } = useAuth();
  const profileId = profileIdOf(profile, user);
  const workerUserId = userIdOf(user);
  const trust = useApi(() => getTrustScore(profileId), [profileId], { immediate: Boolean(profileId) });
  const jobs = useApi(getRecommendedJobs, [], { immediate: true });
  const applications = useApi(() => getWorkerApplications(workerUserId), [workerUserId], {
    immediate: Boolean(workerUserId),
  });

  const score = trust.data?.score ?? profile?.kaushalTrustScore ?? 0;
  const breakdown = trust.data?.breakdown ?? profile?.trustScoreBreakdown;
  const applicationList = asList(applications.data);
  const recommendedJobs = asList(jobs.data).slice(0, 3);
  const latestApplication = applicationList[0];

  return (
    <>
      <PageHeader
        eyebrow="Worker portal"
        title={`Hello, ${profile?.name || "worker"}`}
        description="Keep your profile strong, find matching jobs, and track hiring updates."
        action={<Button onClick={() => onNavigate?.("/worker/jobs")}>Find jobs</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Trust score" value={score} meta="Transparent Kaushal score" />
        <StatCard label="Skills" value={profile?.skills?.length || 0} meta="Declared and verified" />
        <StatCard label="Applications" value={applicationList.length} meta="Across active jobs" />
        <StatCard
          label="Availability"
          value={AVAILABILITY_LABELS[profile?.availability] || "Not set"}
          meta={formatSalary(profile?.expectedSalary)}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">Profile strength</h2>
          <div className="mt-4">
            <TrustScore score={score} breakdown={breakdown} />
          </div>
          <dl className="mt-5 grid gap-3 text-sm">
            <div>
              <dt className="font-semibold text-slate-700">Occupation</dt>
              <dd className="text-slate-600">{profile?.primaryOccupation || "Add occupation"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-700">Experience</dt>
              <dd className="text-slate-600">{profile?.yearsOfExperience || 0} years</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-700">Languages</dt>
              <dd className="text-slate-600">{profile?.languages?.join(", ") || "Add languages"}</dd>
            </div>
          </dl>
          <Button variant="secondary" className="mt-5 w-full" onClick={() => onNavigate?.("/worker/profile")}>
            Update profile
          </Button>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-950">Recommended jobs</h2>
            <Button variant="ghost" className="min-h-10 px-3" onClick={() => onNavigate?.("/worker/jobs")}>
              View all
            </Button>
          </div>
          {jobs.loading && <LoadingState label="Loading jobs..." />}
          {jobs.error && <ErrorState error={jobs.error} onRetry={jobs.refetch} />}
          {!jobs.loading && !jobs.error && (
            <div className="grid gap-4">
              {recommendedJobs.length > 0 ? (
                recommendedJobs.map((job) => <JobCard key={job._id} job={job} onView={() => onNavigate?.("/worker/jobs")} />)
              ) : (
                <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
                  No recommended jobs yet. Try search from the jobs page.
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-950">Latest application</h2>
          <Button variant="ghost" className="min-h-10 px-3" onClick={() => onNavigate?.("/worker/applications")}>
            Track all
          </Button>
        </div>
        {applications.loading && <p className="mt-3 text-sm text-slate-500">Loading applications...</p>}
        {applications.error && <ErrorState error={applications.error} onRetry={applications.refetch} />}
        {!applications.loading && !applications.error && latestApplication && (
          <div className="mt-4 grid gap-2 text-sm sm:grid-cols-4">
            <div>
              <p className="font-semibold text-slate-700">Job</p>
              <p className="text-slate-600">{latestApplication.jobId?.title || "Job"}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-700">Status</p>
              <p className="text-slate-600">{formatStatus(latestApplication.status)}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-700">Applied</p>
              <p className="text-slate-600">{formatDate(latestApplication.appliedAt || latestApplication.createdAt)}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-700">Match</p>
              <p className="text-slate-600">{latestApplication.matchScore ?? "-"}%</p>
            </div>
          </div>
        )}
        {!applications.loading && !applications.error && !latestApplication && (
          <p className="mt-3 text-sm text-slate-500">No applications yet.</p>
        )}
      </section>
    </>
  );
}
