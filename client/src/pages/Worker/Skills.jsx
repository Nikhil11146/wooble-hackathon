import { useState } from "react";
import Button from "../../components/Common/Button";
import { EmptyState, ErrorState, LoadingState, Notice, PageHeader } from "../../components/Common/PageState";
import SkillCard from "../../components/Cards/SkillCard";
import SkillForm from "../../components/Forms/SkillForm";
import useApi from "../../hooks/useApi";
import useAuth from "../../hooks/useAuth";
import {
  addWorkerSkill,
  getWorkerSkills,
  removeWorkerSkill,
  requestVerification,
  updateWorkerSkill,
} from "../../services/worker.service";
import { asList, profileIdOf, userIdOf } from "../../utils/apiData";

export default function WorkerSkills() {
  const { user, profile, refreshProfile } = useAuth();
  const profileId = profileIdOf(profile, user);
  const skills = useApi(() => getWorkerSkills(profileId), [profileId], { immediate: Boolean(profileId) });
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const saveSkill = async (payload) => {
    setSubmitting(true);
    setNotice("");
    setError("");
    try {
      const nextSkills = editing?._id
        ? await updateWorkerSkill(profileId, editing._id, payload)
        : await addWorkerSkill(profileId, payload);
      skills.setData(asList(nextSkills));
      setEditing(null);
      await refreshProfile();
      setNotice(editing?._id ? "Skill updated." : "Skill added.");
    } catch (err) {
      setError(err.message || "Unable to save skill.");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteSkill = async (skill) => {
    if (!window.confirm(`Remove ${skill.name}?`)) return;
    setNotice("");
    setError("");
    try {
      const nextSkills = await removeWorkerSkill(profileId, skill._id);
      skills.setData(asList(nextSkills));
      await refreshProfile();
      setNotice("Skill removed.");
    } catch (err) {
      setError(err.message || "Unable to remove skill.");
    }
  };

  const verifySkill = async (skill) => {
    setNotice("");
    setError("");
    try {
      await requestVerification({
        workerId: userIdOf(user),
        skillName: skill.name,
        verificationType: "DOCUMENT",
        notes: "Submitted from worker portal.",
      });
      await skills.refetch();
      await refreshProfile();
      setNotice("Verification request submitted.");
    } catch (err) {
      setError(err.message || "Unable to request verification.");
    }
  };

  const skillList = asList(skills.data);

  return (
    <>
      <PageHeader
        eyebrow="Worker portal"
        title="Skills"
        description="Add the practical skills employers should match against."
      />

      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-[#222d34] dark:bg-[#202c33] dark:shadow-black/25 dark:backdrop-blur">
          <h2 className="text-xl font-bold tracking-tight text-slate-950 dark:text-[#e9edef]">{editing ? "Edit skill" : "Add skill"}</h2>
          <div className="mt-4">
            <SkillForm key={editing?._id || "new"} initialValue={editing || {}} onSubmit={saveSkill} submitting={submitting} />
          </div>
          {editing && (
            <Button variant="ghost" className="mt-3 px-0" onClick={() => setEditing(null)}>
              Cancel edit
            </Button>
          )}
        </section>

        <section>
          <div className="mb-4 grid gap-3">
            {notice && <Notice type="success">{notice}</Notice>}
            {error && <Notice type="error">{error}</Notice>}
          </div>
          {skills.loading && <LoadingState label="Loading skills..." />}
          {skills.error && <ErrorState error={skills.error} onRetry={skills.refetch} />}
          {!skills.loading && !skills.error && (
            <div className="grid gap-3">
              {skillList.length > 0 ? (
                skillList.map((skill) => (
                  <SkillCard
                    key={skill._id || skill.name}
                    skill={skill}
                    onEdit={setEditing}
                    onDelete={deleteSkill}
                    onVerify={verifySkill}
                  />
                ))
              ) : (
                <EmptyState title="No skills yet" message="Add your first skill to improve job matching." />
              )}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
