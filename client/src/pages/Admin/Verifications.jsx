import { useState } from "react";
import Button from "../../components/Common/Button";
import { EmptyState, ErrorState, LoadingState, Notice, PageHeader } from "../../components/Common/PageState";
import useApi from "../../hooks/useApi";
import { approveVerification, getPendingVerifications, rejectVerification } from "../../services/admin.service";
import { asList } from "../../utils/apiData";
import { formatDate, formatStatus } from "../../utils/format";

function workerLabel(verification) {
  const worker = verification.workerId;
  if (!worker) return "Worker";
  if (typeof worker === "object") return worker.email || worker._id;
  return worker;
}

export default function AdminVerifications() {
  const verifications = useApi(getPendingVerifications, [], { immediate: true });
  const [reviewingId, setReviewingId] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const items = asList(verifications.data);

  const review = async (verification, action) => {
    setReviewingId(verification._id);
    setNotice("");
    setError("");
    try {
      if (action === "approve") {
        await approveVerification(verification._id, "Approved from admin portal.");
        setNotice(`${verification.skillName} approved.`);
      } else {
        const notes = window.prompt("Reason for rejection", "Needs clearer proof.");
        if (notes == null) return;
        await rejectVerification(verification._id, notes);
        setNotice(`${verification.skillName} rejected.`);
      }
      verifications.setData(items.filter((item) => item._id !== verification._id));
    } catch (err) {
      setError(err.message || "Unable to review verification.");
    } finally {
      setReviewingId("");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Admin portal"
        title="Verification queue"
        description="Approve or reject worker skill verification requests."
        action={<Button variant="secondary" onClick={verifications.refetch}>Refresh</Button>}
      />

      <div className="mb-4 grid gap-3">
        {notice && <Notice type="success">{notice}</Notice>}
        {error && <Notice type="error">{error}</Notice>}
      </div>

      {verifications.loading && <LoadingState label="Loading verifications..." />}
      {verifications.error && <ErrorState error={verifications.error} onRetry={verifications.refetch} />}
      {!verifications.loading && !verifications.error && (
        <>
          {items.length === 0 ? (
            <EmptyState title="No pending verifications" message="New worker verification requests will appear here." />
          ) : (
            <div className="grid gap-4">
              {items.map((verification) => (
                <article key={verification._id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-bold text-slate-950">{verification.skillName}</h2>
                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                          {formatStatus(verification.verificationStatus)}
                        </span>
                      </div>
                      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <dt className="font-semibold text-slate-700">Worker</dt>
                          <dd className="text-slate-600">{workerLabel(verification)}</dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-slate-700">Type</dt>
                          <dd className="text-slate-600">{formatStatus(verification.verificationType)}</dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-slate-700">Requested</dt>
                          <dd className="text-slate-600">{formatDate(verification.createdAt)}</dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-slate-700">Document</dt>
                          <dd className="text-slate-600">
                            {verification.documentUrl ? (
                              <a className="font-semibold text-blue-700" href={verification.documentUrl} target="_blank" rel="noreferrer">
                                Open
                              </a>
                            ) : (
                              "Not attached"
                            )}
                          </dd>
                        </div>
                      </dl>
                      {verification.notes && <p className="mt-3 text-sm text-slate-600">{verification.notes}</p>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button loading={reviewingId === verification._id} onClick={() => review(verification, "approve")}>
                        Approve
                      </Button>
                      <Button variant="danger" loading={reviewingId === verification._id} onClick={() => review(verification, "reject")}>
                        Reject
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
