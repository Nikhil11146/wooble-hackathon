import { useCallback, useEffect, useState } from "react";
import Button from "../../components/Common/Button";
import Input from "../../components/Common/Input";
import Modal from "../../components/Common/Modal";
import { EmptyState, ErrorState, LoadingState, Notice, PageHeader } from "../../components/Common/PageState";
import JobCard from "../../components/Cards/JobCard";
import useAuth from "../../hooks/useAuth";
import { applyToJob, getJobById, getRecommendedJobs, getWorkerApplications, searchJobs } from "../../services/worker.service";
import { asList, userIdOf } from "../../utils/apiData";
import { EMPLOYMENT_TYPES } from "../../utils/constants";
import { formatDate, formatEmploymentType, formatSalary } from "../../utils/format";

const defaultFilters = {
  query: "",
  category: "",
  minSalary: "",
  maxSalary: "",
  employmentType: "",
};

export default function WorkerJobDiscovery() {
  const { user } = useAuth();
  const workerUserId = userIdOf(user);
  const [filters, setFilters] = useState(defaultFilters);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [applyingId, setApplyingId] = useState("");
  const [appliedIds, setAppliedIds] = useState([]);
  const [activeJob, setActiveJob] = useState(null);
  const [jobDetails, setJobDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const loadRecommended = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getRecommendedJobs();
      setJobs(asList(data));
    } catch (err) {
      setError(err.message || "Unable to load jobs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) loadRecommended();
    });
    return () => {
      active = false;
    };
  }, [loadRecommended]);

  useEffect(() => {
    if (!workerUserId) return undefined;
    let active = true;
    queueMicrotask(() => {
      getWorkerApplications(workerUserId)
        .then((items) => {
          if (!active) return;
          const ids = asList(items)
            .map((application) => application.jobId?._id || application.jobId)
            .filter(Boolean);
          setAppliedIds(ids);
        })
        .catch(() => undefined);
    });
    return () => {
      active = false;
    };
  }, [workerUserId]);

  const setField = (field) => (event) => {
    setFilters((current) => ({ ...current, [field]: event.target.value }));
  };

  const submitSearch = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const data = await searchJobs(filters);
      setJobs(asList(data));
    } catch (err) {
      setError(err.message || "Unable to search jobs.");
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    loadRecommended();
  };

  const apply = async (job) => {
    setApplyingId(job._id);
    setNotice("");
    setError("");
    try {
      await applyToJob(job._id, workerUserId);
      setAppliedIds((current) => [...new Set([...current, job._id])]);
      setNotice(`Applied to ${job.title}.`);
      setActiveJob(null);
    } catch (err) {
      setError(err.message || "Unable to apply for this job.");
    } finally {
      setApplyingId("");
    }
  };

  const openJob = async (job) => {
    setActiveJob(job);
    setJobDetails(job);
    setDetailsLoading(true);
    try {
      const details = await getJobById(job._id);
      setJobDetails(details || job);
    } catch {
      setJobDetails(job);
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Worker portal"
        title="Job discovery"
        description="Search open jobs and apply with your KaushalSetu profile."
      />

      <form onSubmit={submitSearch} className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-[#222d34] dark:bg-[#202c33] dark:shadow-black/25 dark:backdrop-blur">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Input label="Keyword" value={filters.query} onChange={setField("query")} placeholder="Electrician" />
          <Input label="Category" value={filters.category} onChange={setField("category")} placeholder="Electrical" />
          <Input label="Min salary" type="number" min="0" value={filters.minSalary} onChange={setField("minSalary")} />
          <Input label="Max salary" type="number" min="0" value={filters.maxSalary} onChange={setField("maxSalary")} />
          <label className="grid gap-1.5 text-sm font-semibold text-slate-700 dark:text-[#aebac1]">
            Type
            <select
              value={filters.employmentType}
              onChange={setField("employmentType")}
              className="min-h-12 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base font-normal focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-[#2a3942] dark:bg-[#2a3942] dark:text-[#e9edef] dark:placeholder:text-[#8696a0] dark:focus:border-[#00a884] dark:focus:ring-[#00a884]/25"
            >
              <option value="">Any</option>
              {Object.entries(EMPLOYMENT_TYPES).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="submit" loading={loading}>
            Search jobs
          </Button>
          <Button type="button" variant="secondary" onClick={clearFilters}>
            Recommended
          </Button>
        </div>
      </form>

      <div className="mb-4 grid gap-3">
        {notice && <Notice type="success">{notice}</Notice>}
        {error && <ErrorState error={error} onRetry={loadRecommended} />}
      </div>

      {loading && <LoadingState label="Loading jobs..." />}
      {!loading && !error && (
        <div className="grid gap-4 lg:grid-cols-2">
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                onView={openJob}
                onApply={appliedIds.includes(job._id) ? undefined : apply}
                actionLabel={appliedIds.includes(job._id) ? "Applied" : applyingId === job._id ? "Applying..." : "Apply"}
              />
            ))
          ) : (
            <div className="lg:col-span-2">
              <EmptyState title="No jobs found" message="Try a broader search or load recommended jobs." />
            </div>
          )}
        </div>
      )}

      <Modal open={Boolean(activeJob)} title={jobDetails?.title || "Job"} onClose={() => setActiveJob(null)}>
        {detailsLoading && <LoadingState label="Loading job..." />}
        {!detailsLoading && jobDetails && (
          <div className="grid gap-3 text-sm">
            <p className="text-slate-600 dark:text-[#aebac1]">{jobDetails.description || "No description provided."}</p>
            <p>
              <span className="font-semibold text-slate-700 dark:text-[#aebac1]">Type: </span>
              {formatEmploymentType(jobDetails.employmentType)}
            </p>
            <p>
              <span className="font-semibold text-slate-700 dark:text-[#aebac1]">Salary: </span>
              {formatSalary(jobDetails.salary)}
            </p>
            <p>
              <span className="font-semibold text-slate-700 dark:text-[#aebac1]">Start: </span>
              {formatDate(jobDetails.startDate)}
            </p>
            {appliedIds.includes(jobDetails._id) ? (
              <p className="font-semibold text-green-700 dark:text-[#25d366]">You have already applied.</p>
            ) : (
              <Button loading={applyingId === jobDetails._id} onClick={() => apply(jobDetails)}>
                Apply now
              </Button>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
