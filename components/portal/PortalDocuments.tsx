"use client";

import { useEffect, useRef, useState } from "react";
import { Ban, Check, Download, FileText, Sparkles } from "lucide-react";
import {
  createPortalContextSnapshot,
} from "@/app/lib/customer-portal-contextual-intelligence";
import type {
  PortalDocumentAssistanceOperation,
  PortalGeneratedGuidance,
} from "@/app/lib/customer-portal-contextual-provider";
import type {
  PortalDocument,
  PortalDocumentAcknowledgement,
} from "@/app/lib/customer-portal-types";
import { usePortal } from "@/components/portal/PortalProvider";
import { PortalGeneratedGuidancePanel } from "@/components/portal/PortalContextualUi";
import {
  PortalEmptyState,
  PortalInlineError,
  PortalPageHeader,
  PortalPageLoader,
  formatFileSize,
  formatPortalDate,
  getPortalLocale,
  portalDefaultTimeZone,
  portalPrimaryButton,
  portalSecondaryButton,
} from "@/components/portal/PortalUi";

type DocumentsState = {
  acknowledgements: PortalDocumentAcknowledgement[];
  documents: PortalDocument[];
};

export function PortalDocuments() {
  const {
    activeProfile,
    branding,
    context,
    dataVersion,
    initialData,
    intelligenceProvider,
    referenceTime,
    repository,
  } = usePortal();
  const [state, setState] = useState<DocumentsState | null>(() => initialData ? {
    acknowledgements: [...initialData.acknowledgements],
    documents: [...initialData.documents],
  } : null);
  const [loadingError, setLoadingError] = useState(false);
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [failedDownloadId, setFailedDownloadId] = useState("");
  const [assistanceDocumentId, setAssistanceDocumentId] = useState("");
  const [assistanceBusy, setAssistanceBusy] = useState("");
  const [guidance, setGuidance] = useState<{
    documentId: string;
    value: PortalGeneratedGuidance;
  } | null>(null);
  const [revision, setRevision] = useState(0);
  const operationRef = useRef(0);
  const locale = getPortalLocale(activeProfile.preferredLanguage);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const documents = await repository.listDocuments();
        const acknowledgements = await repository.listAcknowledgements(
          documents
            .filter((document) => document.availability === "available")
            .map((document) => document.id)
        );
        if (active) {
          setLoadingError(false);
          setState({ acknowledgements, documents });
        }
      } catch {
        if (active) setLoadingError(true);
      }
    }
    void load();
    return () => {
      active = false;
      operationRef.current += 1;
    };
  }, [dataVersion, repository, revision]);

  async function acknowledge(documentId: string) {
    setBusyId(documentId);
    setActionError("");
    try {
      const acknowledgement = await repository.acknowledgeDocument(documentId);
      setState((current) => current ? {
        ...current,
        acknowledgements: [
          ...current.acknowledgements.filter((item) => item.documentId !== documentId),
          acknowledgement,
        ],
      } : current);
    } catch {
      setActionError("The document could not be acknowledged. Refresh and try again.");
    } finally {
      setBusyId("");
    }
  }

  async function download(documentId: string) {
    const operation = ++operationRef.current;
    setBusyId(documentId);
    setActionError("");
    setFailedDownloadId("");
    try {
      const downloadUrl = await repository.downloadDocument(documentId);
      if (operation !== operationRef.current) return;
      window.location.assign(downloadUrl);
    } catch {
      if (operation !== operationRef.current) return;
      setFailedDownloadId(documentId);
      setActionError("This download is not available right now. Contact support if you need the document urgently.");
    } finally {
      if (operation === operationRef.current) setBusyId("");
    }
  }

  async function requestAssistance(
    document: PortalDocument,
    operation: PortalDocumentAssistanceOperation
  ) {
    if (!state) return;
    setAssistanceBusy(`${document.id}:${operation}`);
    const snapshot = createPortalContextSnapshot({
      acknowledgements: state.acknowledgements,
      appointments: initialData?.appointments,
      branding,
      context,
      documents: state.documents,
      messages: initialData?.messages,
      profile: activeProfile,
      referenceTime,
      requests: initialData?.requests,
    });
    try {
      const value = await intelligenceProvider.assistDocument({
        document,
        operation,
        snapshot,
        targetLanguage: activeProfile.preferredLanguage.toLowerCase(),
      });
      setGuidance({ documentId: document.id, value });
    } finally {
      setAssistanceBusy("");
    }
  }

  const acknowledgedIds = new Set(state?.acknowledgements.map((item) => item.documentId) ?? []);

  return (
    <div className="space-y-8">
      <PortalPageHeader
        eyebrow="Documents"
        title="Files shared with you"
        description="Access current customer documents without exposing private storage details."
      />

      {loadingError ? (
        <PortalInlineError message="Documents could not be loaded." retry={() => setRevision((value) => value + 1)} />
      ) : !state ? (
        <PortalPageLoader label="Loading documents" />
      ) : state.documents.length === 0 ? (
        <PortalEmptyState icon={FileText} title="No documents shared" description="Quotes, instructions, contracts, reports, receipts, and other files will appear here when shared with you." />
      ) : (
        <section className="grid gap-4 md:grid-cols-2" aria-label="Shared documents">
          {state.documents.map((document) => {
            const acknowledged = acknowledgedIds.has(document.id);
            const revoked = document.availability === "revoked";
            return (
              <article key={document.id} className={`rounded-[2rem] border bg-white p-5 shadow-sm sm:p-6 ${revoked ? "border-slate-300 opacity-75" : "border-slate-200"}`}>
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-800">
                    <FileText aria-hidden="true" size={21} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-600">{document.documentType}</p>
                    <h2 className="mt-1 break-words text-lg font-semibold">{document.title}</h2>
                    <p className="mt-2 text-xs text-slate-500">
                      Shared {formatPortalDate(document.sharedAt, {
                        locale,
                        timeZone: portalDefaultTimeZone,
                      })} · {formatFileSize(document.fileSize)}
                    </p>
                    {revoked ? <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700"><Ban aria-hidden="true" size={14} /> No longer available</p> : null}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  <button className={portalPrimaryButton} type="button" disabled={revoked || busyId === document.id} onClick={() => void download(document.id)}>
                    <Download aria-hidden="true" size={16} /> {revoked ? "Unavailable" : busyId === document.id ? "Preparing..." : "Download"}
                  </button>
                  <button
                    className={portalSecondaryButton}
                    type="button"
                    disabled={revoked || acknowledged || busyId === document.id}
                    onClick={() => void acknowledge(document.id)}
                  >
                    <Check aria-hidden="true" size={16} /> {acknowledged ? "Acknowledged" : "Acknowledge"}
                  </button>
                  {intelligenceProvider.mode !== "unavailable" ? (
                    <button
                      className={portalSecondaryButton}
                      type="button"
                      disabled={revoked}
                      aria-expanded={assistanceDocumentId === document.id}
                      aria-controls={`document-assistance-${document.id}`}
                      onClick={() => {
                        setGuidance(null);
                        setAssistanceDocumentId((current) =>
                          current === document.id ? "" : document.id
                        );
                      }}
                    >
                      <Sparkles aria-hidden="true" size={16} /> Context help
                    </button>
                  ) : null}
                </div>

                {intelligenceProvider.mode !== "unavailable" && assistanceDocumentId === document.id && !revoked ? (
                  <div id={`document-assistance-${document.id}`} className="mt-5 border-t border-slate-200 pt-5">
                    <p className="text-sm font-semibold text-slate-950">Choose one customer-safe action</p>
                    <p className="mt-1 text-xs leading-5 text-slate-600">
                      The original document remains the source of truth. No action changes the document.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2" aria-label={`Context help for ${document.title}`}>
                      {([
                        ["explain", "Explain"],
                        ["summarize", "Summarize"],
                        ["key-actions", "Key actions"],
                        ["important-dates", "Important dates"],
                        ["questions", "Questions to ask"],
                        ["related-context", "Related context"],
                      ] as const).map(([operation, label]) => (
                        <button
                          key={operation}
                          type="button"
                          className={portalSecondaryButton}
                          disabled={Boolean(assistanceBusy)}
                          onClick={() => void requestAssistance(document, operation)}
                        >
                          {assistanceBusy === `${document.id}:${operation}` ? "Working..." : label}
                        </button>
                      ))}
                      {intelligenceProvider.supportedLanguages.includes(
                        activeProfile.preferredLanguage.toLowerCase()
                      ) ? (
                        <button
                          type="button"
                          className={portalSecondaryButton}
                          disabled={Boolean(assistanceBusy)}
                          onClick={() => void requestAssistance(document, "translate")}
                        >
                          {assistanceBusy === `${document.id}:translate` ? "Working..." : "Translate demo summary"}
                        </button>
                      ) : null}
                    </div>
                    <div className="mt-4" aria-live="polite">
                      {guidance?.documentId === document.id ? (
                        <PortalGeneratedGuidancePanel guidance={guidance.value} />
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </section>
      )}

      <div aria-live="polite">{actionError ? <PortalInlineError message={actionError} retry={failedDownloadId ? () => void download(failedDownloadId) : undefined} /> : null}</div>
    </div>
  );
}
