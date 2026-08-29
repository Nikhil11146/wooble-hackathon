import { useCallback, useEffect, useState } from "react";
import Button from "../../components/Common/Button";
import Input from "../../components/Common/Input";
import Modal from "../../components/Common/Modal";
import { EmptyState, ErrorState, LoadingState, Notice, PageHeader } from "../../components/Common/PageState";
import CandidateCard from "../../components/Cards/CandidateCard";
import TrustScore from "../../components/Common/TrustScore";
import useApi from "../../hooks/useApi";
import useAuth from "../../hooks/useAuth";
import {
  getAllCandidates,
  getCandidateDetails,
  getEmployerJobs,
  searchCandidates,
  shortlistCandidate,
} from "../../services/employer.service";
import { asList, userIdOf } from "../../utils/apiData";
import { AVAILABILITY_LABELS } from "../../utils/constants";
import { formatDate, formatSalary } from "../../utils/format";

const defaultFilters = {
  skill: "",
  occupation: "",
  minExperience: "",
  availability: "",
  maxSalary: "",
};

function resolveWorkerUserId(candidate) {
  const userId = candidate?.userId;
  if (!userId) return candidate?._id;
  if (typeof userId === "object") return userId._id || userId.id;
  return userId;
}

function matchReasons(candidate) {
  return [
    candidate.availability ? AVAILABILITY_LABELS[candidate.availability] : null,
    candidate.yearsOfExperience != null ? `${candidate.yearsOfExperience} years experience` : null,
    candidate.kaushalTrustScore != null ? `${candidate.kaushalTrustScore}/100 trust score` : null,
  ].filter(Boolean);
}

export default function EmployerCandidateSearch() {
  const { user } = useAuth();
  const employerUserId = userIdOf(user);
  const [filters, setFilters] = useState(defaultFilters);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedJobId, setSelectedJobId] = useState("");
  const [activeCandidate, setActiveCandidate] = useState(null);
  const [details, setDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const jobs = useApi(() => getEmployerJobs(employerUserId), [employerUserId], { immediate: Boolean(employerUserId) });
  const jobList = asList(jobs.data);
  const defaultJobId = jobList.find((job) => job.status !== "CLOSED")?._id || "";
  const shortlistJobId = selectedJobId || defaultJobId;

  const loadCandidates = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAllCandidates(employerUserId);
      setCandidates(asList(data));
    } catch (err) {
      setError(err.message || "Unable to load candidates.");
    } finally {
      setLoading(false);
    }
  }, [employerUserId]);

  useEffect(() => {
    if (!employerUserId) return undefined;
    let active = true;
    queueMicrotask(() => {
      if (active) loadCandidates();
    });
    return () => {
      active = false;
    };
  }, [loadCandidates, employerUserId]);

  const setField = (field) => (event) => {
    setFilters((current) => ({ ...current, [field]: event.target.value }));
  };

  const submitSearch = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const data = await searchCandidates(employerUserId, filters);
      setCandidates(asList(data));
    } catch (err) {
      setError(err.message || "Unable to search candidates.");
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    loadCandidates();
  };

  const openCandidate = async (candidate) => {
    setActiveCandidate(candidate);
    setDetails(candidate);
    setDetailsLoading(true);
    try {
      const data = await getCandidateDetails(employerUserId, resolveWorkerUserId(candidate));
      setDetails(data);
    } catch {
      setDetails(candidate);
    } finally {
      setDetailsLoading(false);
    }
  };

  const shortlist = async (candidate) => {
    if (!shortlistJobId) {
      setError("Select a job before shortlisting.");
      return;
    }
    setNotice("");
    setError("");
    try {
      await shortlistCandidate(employerUserId, resolveWorkerUserId(candidate), shortlistJobId);
      setNotice(`${candidate.name || "Candidate"} shortlisted.`);
    } catch (err) {
      setError(err.message || "Unable to shortlist candidate.");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Employer portal"
        title="Candidate search"
        description="Find workers by skill, occupation, experience, availability, and salary fit."
      />

      <form onSubmit={submitSearch} className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Input label="Skill" value={filters.skill} onChange={setField("skill")} placeholder="Safety" />
          <Input label="Occupation" value={filters.occupation} onChange={setField("occupation")} placeholder="Electrician" />
          <Input label="Min experience" type="number" min="0" value={filters.minExperience} onChange={setField("minExperience")} />
          <Input label="Max salary" type="number" min="0" value={filters.maxSalary} onChange={setField("maxSalary")} />
          <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
            Availability
            <select
              value={filters.availability}
              onChange={setField("availability")}
              className="min-h-12 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base font-normal focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="">Any</option>
              {Object.entries(AVAILABILITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
            Shortlist for job
            <select
              value={shortlistJobId}
              onChange={(event) => setSelectedJobId(event.target.value)}
              className="min-h-12 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base font-normal focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="">Select job</option>
              {jobList.map((job) => (
                <option key={job._id} value={job._id}>
                  {job.title}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" loading={loading}>
              Search
            </Button>
            <Button type="button" variant="secondary" onClick={clearFilters}>
              Clear
            </Button>
          </div>
        </div>
      </form>

      <div className="mb-4 grid gap-3">
        {notice && <Notice type="success">{notice}</Notice>}
        {error && <Notice type="error">{error}</Notice>}
      </div>

      {loading && <LoadingState label="Loading candidates..." />}
      {!loading && (
        <div className="grid gap-4 lg:grid-cols-2">
          {candidates.length > 0 ? (
            candidates.map((candidate) => (
              <CandidateCard
                key={candidate._id}
                candidate={candidate}
                matchScore={candidate.matchScore}
                matchReasons={matchReasons(candidate)}
                onView={openCandidate}
                onShortlist={shortlist}
                shortlistDisabled={!shortlistJobId}
              />
            ))
          ) : (
            <div className="lg:col-span-2">
              {error ? (
                <ErrorState error={error} onRetry={loadCandidates} />
              ) : (
                <EmptyState title="No candidates found" message="Try fewer filters or clear the search." />
              )}
            </div>
          )}
        </div>
      )}

      <Modal open={Boolean(activeCandidate)} title={details?.name || "Candidate"} onClose={() => setActiveCandidate(null)}>
        {detailsLoading && <LoadingState label="Loading profile..." />}
        {!detailsLoading && details && (
          <div className="grid gap-4">
            <TrustScore score={details.kaushalTrustScore} breakdown={details.trustScoreBreakdown} />
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-semibold text-slate-700">Occupation</dt>
                <dd className="text-slate-600">{details.primaryOccupation || "Not set"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-700">Expected salary</dt>
                <dd className="text-slate-600">{formatSalary(details.expectedSalary)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-700">Availability</dt>
                <dd className="text-slate-600">{AVAILABILITY_LABELS[details.availability] || "Not set"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-700">Contact</dt>
                <dd className="text-slate-600">{details.phone || details.userId?.email || "Not shared"}</dd>
              </div>
            </dl>
            <div>
              <h3 className="font-semibold text-slate-900">Skills</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {(details.skills || []).map((skill) => (
                  <span key={skill._id || skill.name} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Work history</h3>
              <div className="mt-2 grid gap-2">
                {asList(details.workHistory).length === 0 && <p className="text-sm text-slate-500">No work history listed.</p>}
                {asList(details.workHistory).map((item) => (
                  <p key={item._id || `${item.companyName}-${item.role}`} className="text-sm text-slate-600">
                    {item.role || "Role"} at {item.companyName || "Company"}
                    {item.startDate ? ` (${formatDate(item.startDate)})` : ""}
                  </p>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Certifications</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {asList(details.certifications).length === 0 && <p className="text-sm text-slate-500">None listed.</p>}
                {asList(details.certifications).map((item) => (
                  <span key={item._id || item.name} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                    {item.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
