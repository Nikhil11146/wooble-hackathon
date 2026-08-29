import { useState } from "react";
import Button from "../../components/Common/Button";
import { ErrorState, LoadingState, Notice, PageHeader, StatCard } from "../../components/Common/PageState";
import useApi from "../../hooks/useApi";
import { getAllUsers, getPlatformAnalytics, updateUserStatus } from "../../services/admin.service";
import { asList } from "../../utils/apiData";
import { formatDate, formatStatus } from "../../utils/format";

const roleClasses = {
  WORKER: "bg-blue-50 text-blue-700 dark:bg-[#00a884]/15 dark:text-[#25d366]",
  EMPLOYER: "bg-amber-50 text-amber-700 dark:bg-[#2a3942] dark:text-[#aebac1]",
  ADMIN: "bg-slate-100 text-slate-700 dark:bg-[#2a3942] dark:text-[#aebac1]",
};

export default function AdminDashboard() {
  const analytics = useApi(getPlatformAnalytics, [], { immediate: true });
  const users = useApi(getAllUsers, [], { immediate: true });
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const data = analytics.data || {};
  const userList = asList(users.data);

  const toggleUser = async (user) => {
    setUpdatingId(user._id || user.id);
    setNotice("");
    setError("");
    try {
      const updated = await updateUserStatus(user._id || user.id, !user.verified);
      users.setData(userList.map((item) => ((item._id || item.id) === (updated._id || updated.id) ? updated : item)));
      setNotice("User status updated.");
    } catch (err) {
      setError(err.message || "Unable to update user.");
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Admin portal"
        title="Platform overview"
        description="Monitor users, jobs, applications, and verification activity."
      />

      {analytics.loading && <LoadingState label="Loading platform analytics..." />}
      {analytics.error && <ErrorState error={analytics.error} onRetry={analytics.refetch} />}
      {!analytics.loading && !analytics.error && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Users" value={data.totalUsers ?? 0} />
          <StatCard label="Workers" value={data.totalWorkers ?? 0} />
          <StatCard label="Employers" value={data.totalEmployers ?? 0} />
          <StatCard label="Active jobs" value={data.activeJobs ?? 0} />
          <StatCard label="Applications" value={data.totalApplications ?? 0} />
          <StatCard label="Hires" value={data.hiredApplications ?? 0} />
          <StatCard label="Pending verifications" value={data.pendingVerifications ?? 0} />
          <StatCard label="Approved verifications" value={data.approvedVerifications ?? 0} />
        </div>
      )}

      <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm dark:border-[#222d34] dark:bg-[#202c33] dark:shadow-black/25 dark:backdrop-blur">
        <header className="border-b border-slate-100 p-4 dark:border-[#222d34]">
          <h2 className="text-xl font-bold tracking-tight text-slate-950 dark:text-[#e9edef]">Users</h2>
        </header>
        <div className="grid gap-3 p-4">
          {notice && <Notice type="success">{notice}</Notice>}
          {error && <Notice type="error">{error}</Notice>}
        </div>
        {users.loading && <div className="p-4"><LoadingState label="Loading users..." /></div>}
        {users.error && <div className="p-4"><ErrorState error={users.error} onRetry={users.refetch} /></div>}
        {!users.loading && !users.error && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-700">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-[#2a3942] dark:text-[#8696a0]">
                <tr>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Verified</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {userList.map((user) => {
                  const id = user._id || user.id;
                  return (
                    <tr key={id}>
                      <td className="px-4 py-3 font-medium text-slate-950 dark:text-[#e9edef]">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${roleClasses[user.role] || "bg-slate-100 text-slate-700 dark:bg-[#2a3942] dark:text-[#aebac1]"}`}>
                          {formatStatus(user.role)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-[#aebac1]">{user.verified ? "Yes" : "No"}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-[#aebac1]">{formatDate(user.createdAt)}</td>
                      <td className="px-4 py-3">
                        <Button
                          variant={user.verified ? "secondary" : "primary"}
                          className="min-h-10 px-3"
                          loading={updatingId === id}
                          onClick={() => toggleUser(user)}
                        >
                          {user.verified ? "Unverify" : "Verify"}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
