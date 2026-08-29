import { useState } from "react";
import Button from "../../components/Common/Button";
import { ErrorState, LoadingState, Notice, PageHeader, StatCard } from "../../components/Common/PageState";
import JobCard from "../../components/Cards/JobCard";
import ProfileForm from "../../components/Forms/ProfileForm";
import useApi from "../../hooks/useApi";
import useAuth from "../../hooks/useAuth";
import {
  getAllCandidates,
  getEmployerAnalytics,
  getEmployerJobs,
  updateEmployerProfile,
} from "../../services/employer.service";
import { asList, profileIdOf, userIdOf } from "../../utils/apiData";

export default function EmployerDashboard({ onNavigate }) {
  const { user, profile, updateProfile } = useAuth();
  const employerUserId = userIdOf(user);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const jobs = useApi(() => getEmployerJobs(employerUserId), [employerUserId], { immediate: Boolean(employerUserId) });
  const analytics = useApi(() => getEmployerAnalytics(employerUserId), [employerUserId], { immediate: Boolean(employerUserId) });
  const candidates = useApi(() => getAllCandidates(employerUserId), [employerUserId], { immediate: Boolean(employerUserId) });

  const saveProfile = async (payload) => {
    setSaving(true);
    setNotice("");
    setError("");
    try {
      const updated = await updateEmployerProfile(profileIdOf(profile, user), payload);
      updateProfile(updated);
      setNotice("Company profile saved.");
    } catch (err) {
      setError(err.message || "Unable to save company profile.");
    } finally {
      setSaving(false);
    }
  };

  const data = analytics.data || {};
  const recentJobs = asList(jobs.data).slice(0, 3);

  return (
    <>
      <PageHeader
        eyebrow="Employer portal"
        title={profile?.companyName || "Employer dashboard"}
        description="Post jobs, discover trusted workers, and manage hiring progress."
        action={<Button onClick={() => onNavigate?.("/employer/jobs/new")}>Post a job</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total jobs" value={data.totalJobs ?? asList(jobs.data).length} />
        <StatCard label="Active jobs" value={data.activeJobs ?? 0} />
        <StatCard label="Applicants" value={data.totalApplicants ?? 0} />
        <StatCard label="Interviews" value={data.interviewCount ?? 0} />
        <StatCard label="Candidates" value={asList(candidates.data).length} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-950">Recent jobs</h2>
            <Button variant="ghost" className="min-h-10 px-3" onClick={() => onNavigate?.("/employer/jobs/new")}>
              Manage
            </Button>
          </div>
          {jobs.loading && <LoadingState label="Loading jobs..." />}
          {jobs.error && <ErrorState error={jobs.error} onRetry={jobs.refetch} />}
          {!jobs.loading && !jobs.error && (
            <div className="grid gap-4">
              {recentJobs.length > 0 ? (
                recentJobs.map((job) => <JobCard key={job._id} job={job} />)
              ) : (
                <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
                  No jobs posted yet.
                </div>
              )}
            </div>
          )}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">Company profile</h2>
          <div className="mt-4 grid gap-3">
            {notice && <Notice type="success">{notice}</Notice>}
            {error && <Notice type="error">{error}</Notice>}
          </div>
          <div className={notice || error ? "mt-4" : "mt-4"}>
            <ProfileForm key={profile?._id || "company"} role="EMPLOYER" profile={profile || {}} onSubmit={saveProfile} submitting={saving} />
          </div>
        </section>
      </div>
    </>
  );
}
