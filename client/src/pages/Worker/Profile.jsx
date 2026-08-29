import { useState } from "react";
import Button from "../../components/Common/Button";
import Input from "../../components/Common/Input";
import { EmptyState, ErrorState, LoadingState, Notice, PageHeader } from "../../components/Common/PageState";
import ProfileForm from "../../components/Forms/ProfileForm";
import TrustScore from "../../components/Common/TrustScore";
import useApi from "../../hooks/useApi";
import useAuth from "../../hooks/useAuth";
import {
  addWorkerCertification,
  addWorkerWorkHistory,
  getWorkerCertifications,
  getWorkerWorkHistory,
  updateWorkerProfile,
} from "../../services/worker.service";
import { profileIdOf } from "../../utils/apiData";
import { AVAILABILITY_LABELS } from "../../utils/constants";
import { formatDate, formatSalary } from "../../utils/format";

export default function WorkerProfile() {
  const { user, profile, updateProfile, refreshProfile } = useAuth();
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const profileId = profileIdOf(profile, user);
  const certifications = useApi(() => getWorkerCertifications(profileId), [profileId], { immediate: Boolean(profileId) });
  const history = useApi(() => getWorkerWorkHistory(profileId), [profileId], { immediate: Boolean(profileId) });
  const [certForm, setCertForm] = useState({ name: "", issuer: "", issueDate: "", expiryDate: "" });
  const [workForm, setWorkForm] = useState({
    companyName: "",
    role: "",
    description: "",
    startDate: "",
    endDate: "",
    currentlyWorking: false,
  });
  const [extraSaving, setExtraSaving] = useState("");

  const saveProfile = async (payload) => {
    setSaving(true);
    setStatus("");
    setError("");
    try {
      const updated = await updateWorkerProfile(profileId, payload);
      updateProfile(updated);
      setStatus("Profile saved.");
    } catch (err) {
      setError(err.message || "Unable to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const saveCertification = async (event) => {
    event.preventDefault();
    if (!certForm.name.trim() || !certForm.issuer.trim()) return;
    setExtraSaving("cert");
    setError("");
    setStatus("");
    try {
      const next = await addWorkerCertification(profileId, certForm);
      certifications.setData(Array.isArray(next) ? next : next?.certifications || []);
      setCertForm({ name: "", issuer: "", issueDate: "", expiryDate: "" });
      await refreshProfile();
      setStatus("Certification added.");
    } catch (err) {
      setError(err.message || "Unable to add certification.");
    } finally {
      setExtraSaving("");
    }
  };

  const saveWork = async (event) => {
    event.preventDefault();
    if (!workForm.companyName.trim() || !workForm.role.trim()) return;
    setExtraSaving("work");
    setError("");
    setStatus("");
    try {
      const next = await addWorkerWorkHistory(profileId, {
        ...workForm,
        currentlyWorking: Boolean(workForm.currentlyWorking),
        endDate: workForm.currentlyWorking ? undefined : workForm.endDate || undefined,
      });
      history.setData(Array.isArray(next) ? next : next?.workHistory || []);
      setWorkForm({
        companyName: "",
        role: "",
        description: "",
        startDate: "",
        endDate: "",
        currentlyWorking: false,
      });
      await refreshProfile();
      setStatus("Work history added.");
    } catch (err) {
      setError(err.message || "Unable to add work history.");
    } finally {
      setExtraSaving("");
    }
  };

  const certList = certifications.data || [];
  const workList = history.data || [];

  return (
    <>
      <PageHeader
        eyebrow="Worker profile"
        title="Professional identity"
        description="Keep the details employers see up to date."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          {status && <Notice type="success">{status}</Notice>}
          {error && <Notice type="error">{error}</Notice>}
          <div className={status || error ? "mt-4" : ""}>
            <ProfileForm key={profileId} profile={profile || {}} onSubmit={saveProfile} submitting={saving} />
          </div>
        </section>

        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">Preview</h2>
          <div className="mt-4">
            <TrustScore score={profile?.kaushalTrustScore} breakdown={profile?.trustScoreBreakdown} />
          </div>
          <dl className="mt-5 grid gap-3 text-sm">
            <div>
              <dt className="font-semibold text-slate-700">Name</dt>
              <dd className="text-slate-600">{profile?.name || "Not set"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-700">Occupation</dt>
              <dd className="text-slate-600">{profile?.primaryOccupation || "Not set"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-700">Expected salary</dt>
              <dd className="text-slate-600">{formatSalary(profile?.expectedSalary)}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-700">Availability</dt>
              <dd className="text-slate-600">{AVAILABILITY_LABELS[profile?.availability] || "Not set"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-700">Contact</dt>
              <dd className="text-slate-600">{profile?.phone || user?.email || "Not set"}</dd>
            </div>
          </dl>
        </aside>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">Work history</h2>
          <form onSubmit={saveWork} className="mt-4 grid gap-3">
            <Input
              label="Company"
              value={workForm.companyName}
              onChange={(event) => setWorkForm((current) => ({ ...current, companyName: event.target.value }))}
              required
            />
            <Input
              label="Role"
              value={workForm.role}
              onChange={(event) => setWorkForm((current) => ({ ...current, role: event.target.value }))}
              required
            />
            <Input
              label="Description"
              value={workForm.description}
              onChange={(event) => setWorkForm((current) => ({ ...current, description: event.target.value }))}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Start date"
                type="date"
                value={workForm.startDate}
                onChange={(event) => setWorkForm((current) => ({ ...current, startDate: event.target.value }))}
              />
              <Input
                label="End date"
                type="date"
                value={workForm.endDate}
                onChange={(event) => setWorkForm((current) => ({ ...current, endDate: event.target.value }))}
                disabled={workForm.currentlyWorking}
              />
            </div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={workForm.currentlyWorking}
                onChange={(event) => setWorkForm((current) => ({ ...current, currentlyWorking: event.target.checked }))}
              />
              Currently working here
            </label>
            <Button type="submit" loading={extraSaving === "work"}>
              Add work history
            </Button>
          </form>
          <div className="mt-5">
            {history.loading && <LoadingState label="Loading work history..." />}
            {history.error && <ErrorState error={history.error} onRetry={history.refetch} />}
            {!history.loading && !history.error && workList.length === 0 && (
              <EmptyState title="No work history" message="Add past roles to strengthen your trust score." />
            )}
            {!history.loading && !history.error && workList.length > 0 && (
              <div className="grid gap-3">
                {workList.map((item) => (
                  <article key={item._id || `${item.companyName}-${item.role}`} className="rounded-lg bg-slate-50 p-3 text-sm">
                    <p className="font-semibold text-slate-950">{item.role || "Role"}</p>
                    <p className="text-slate-600">{item.companyName}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatDate(item.startDate)} - {item.currentlyWorking ? "Present" : formatDate(item.endDate)}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">Certifications</h2>
          <form onSubmit={saveCertification} className="mt-4 grid gap-3">
            <Input
              label="Certificate name"
              value={certForm.name}
              onChange={(event) => setCertForm((current) => ({ ...current, name: event.target.value }))}
              required
            />
            <Input
              label="Issuer"
              value={certForm.issuer}
              onChange={(event) => setCertForm((current) => ({ ...current, issuer: event.target.value }))}
              required
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Issue date"
                type="date"
                value={certForm.issueDate}
                onChange={(event) => setCertForm((current) => ({ ...current, issueDate: event.target.value }))}
              />
              <Input
                label="Expiry date"
                type="date"
                value={certForm.expiryDate}
                onChange={(event) => setCertForm((current) => ({ ...current, expiryDate: event.target.value }))}
              />
            </div>
            <Button type="submit" loading={extraSaving === "cert"}>
              Add certification
            </Button>
          </form>
          <div className="mt-5">
            {certifications.loading && <LoadingState label="Loading certifications..." />}
            {certifications.error && <ErrorState error={certifications.error} onRetry={certifications.refetch} />}
            {!certifications.loading && !certifications.error && certList.length === 0 && (
              <EmptyState title="No certifications" message="Safety and trade certificates improve matching." />
            )}
            {!certifications.loading && !certifications.error && certList.length > 0 && (
              <div className="grid gap-3">
                {certList.map((item) => (
                  <article key={item._id || item.name} className="rounded-lg bg-slate-50 p-3 text-sm">
                    <p className="font-semibold text-slate-950">{item.name}</p>
                    <p className="text-slate-600">{item.issuer}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatDate(item.issueDate)} {item.expiryDate ? `- expires ${formatDate(item.expiryDate)}` : ""}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
