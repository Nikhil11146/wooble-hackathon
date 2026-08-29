import { useState } from "react";
import Button from "../../components/Common/Button";
import { Notice, PageHeader } from "../../components/Common/PageState";
import ProfileForm from "../../components/Forms/ProfileForm";
import SkillForm from "../../components/Forms/SkillForm";
import useAuth from "../../hooks/useAuth";
import { addWorkerSkill, updateWorkerProfile } from "../../services/worker.service";
import { profileIdOf } from "../../utils/apiData";

export default function WorkerOnboarding({ onNavigate }) {
  const { user, profile, updateProfile, refreshProfile } = useAuth();
  const profileId = profileIdOf(profile, user);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const saveProfile = async (payload) => {
    setSaving(true);
    setError("");
    try {
      const updated = await updateWorkerProfile(profileId, payload);
      updateProfile(updated);
      setStep(2);
    } catch (err) {
      setError(err.message || "Unable to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const saveSkill = async (payload) => {
    setSaving(true);
    setError("");
    try {
      await addWorkerSkill(profileId, payload);
      await refreshProfile();
      onNavigate?.("/worker");
    } catch (err) {
      setError(err.message || "Unable to add skill.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Worker setup"
        title={step === 1 ? "Complete your profile" : "Add your first skill"}
        description="Employers match you on occupation, availability, and verified skills."
      />

      <section className="mx-auto max-w-xl rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-slate-500">Step {step} of 2</p>
        {error && (
          <div className="mt-4">
            <Notice type="error">{error}</Notice>
          </div>
        )}
        <div className="mt-4">
          {step === 1 ? (
            <ProfileForm key={profileId} profile={profile || {}} onSubmit={saveProfile} submitting={saving} />
          ) : (
            <>
              <SkillForm onSubmit={saveSkill} submitting={saving} />
              <Button variant="ghost" className="mt-3 px-0" onClick={() => onNavigate?.("/worker")}>
                Skip for now
              </Button>
            </>
          )}
        </div>
      </section>
    </>
  );
}
