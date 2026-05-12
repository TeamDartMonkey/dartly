"use client";

import { useState } from "react";
import { showToast } from "@/components/ui/toast";
import type { DocumentResponse } from "@/types/document";

interface DownloadButtonProps {
  doc: DocumentResponse;
  signedUrl?: string | null;
  // Optional override so the caller can pass content from a non-latest
  // version. When omitted, the latest version's content (doc.content) is
  // used. UPLOADED docs ignore this — they always fetch from storage since
  // historical files share the same fileUrl.
  versionContent?: string;
  versionNumber?: number;
}

async function downloadUploaded(name: string, signedUrl?: string | null) {
  if (!signedUrl) {
    throw new Error("No file URL available");
  }

  const res = await fetch(signedUrl);
  if (!res.ok) throw new Error("Failed to fetch file");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name.endsWith(".pdf") ? name : `${name}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

async function downloadUploadedById(name: string, docId: string) {
  const urlRes = await fetch(`/api/documents/${docId}/signed-url`);
  if (!urlRes.ok) throw new Error("Failed to get download URL");
  const { url } = await urlRes.json();
  await downloadUploaded(name, url);
}

// Sanitizes HTML using hast-util-sanitize (same approach as the in-app
// markdown renderer). The previous regex-based blacklist could not stop
// attribute-encoded handlers, namespaced events, javascript: URLs, etc.
async function sanitizeResumeHtml(html: string): Promise<string> {
  const { rehype } = await import("rehype");
  const rehypeSanitize = (await import("rehype-sanitize")).default;
  const { defaultSchema } = await import("hast-util-sanitize");
  const schema = {
    ...defaultSchema,
    attributes: {
      ...defaultSchema.attributes,
      span: [...(defaultSchema.attributes?.span ?? []), "className", "class"],
      div: [...(defaultSchema.attributes?.div ?? []), "className", "class"],
    },
    tagNames: Array.from(new Set([...(defaultSchema.tagNames ?? []), "span", "div"])),
  };
  const file = await rehype()
    .data("settings", { fragment: true })
    .use(rehypeSanitize, schema)
    .process(html);
  return String(file);
}

export async function downloadGenerated(name: string, type: string, content: string) {
  const { default: html2canvas } = await import("html2canvas");
  const { default: jsPDF } = await import("jspdf");
  const { remark } = await import("remark");
  const { default: remarkHtml } = await import("remark-html");

  const result = await remark().use(remarkHtml, { sanitize: false }).process(content);
  const htmlContent = await sanitizeResumeHtml(String(result));

  const cssRes = await fetch("/jakes-resume.css");
  const cssText = cssRes.ok ? await cssRes.text() : "";

  const LETTER_PX = 816;

  const iframe = document.createElement("iframe");
  iframe.style.cssText =
    `position: fixed; left: -9999px; top: 0; width: ${LETTER_PX}px; height: 1px; border: none;`;
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument;
  if (!iframeDoc) {
    document.body.removeChild(iframe);
    throw new Error("Failed to create document for PDF rendering");
  }

  iframeDoc.open();
  iframeDoc.write(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      html, body {
        background: #ffffff;
        color: #000000;
        width: ${LETTER_PX}px;
      }
      ${cssText}
      /* PDF-only size overrides — bump everything up so the resume fills
         more of the letter page.  On-screen sizes (9–11pt) are fine for the
         compact dark preview pane but look tiny on a printed PDF. */
      .jakes-resume-preview {
        max-width: none !important;
        width: ${LETTER_PX}px !important;
        margin: 0 !important;
        font-size: 11pt !important;
        line-height: 1.45 !important;
        padding: 0.45in !important;
      }
      .jakes-resume-preview h1 {
        font-size: 28pt !important;
        margin-bottom: 4pt !important;
      }
      .jakes-resume-preview h2 {
        font-size: 13pt !important;
        padding-bottom: 3pt !important;
      }
      .jakes-resume-preview h3 {
        font-size: 12.5pt !important;
      }
      .jakes-resume-preview p {
        font-size: 11pt !important;
      }
      .jakes-resume-preview ul {
        font-size: 10.5pt !important;
      }
      .jakes-resume-preview li {
        font-size: 10.5pt !important;
        line-height: 1.4 !important;
        margin-bottom: 2pt !important;
      }
      .jakes-resume-preview .normal {
        font-size: 10pt !important;
      }
      .jakes-resume-preview .section.headerInfo p {
        font-size: 10.5pt !important;
      }
      .jakes-resume-preview h3.pdf-section-header {
        display: block !important;
        border-bottom: 1px solid #1a1a1a !important;
        text-transform: uppercase !important;
        letter-spacing: 0.08em !important;
        font-size: 13pt !important;
        margin: 10pt 0 0 0 !important;
        padding: 0 0 7pt 0 !important;
        font-weight: 700 !important;
      }
      .jakes-resume-preview h3.pdf-job-title {
        display: flex !important;
        flex-wrap: wrap !important;
        justify-content: space-between !important;
        align-items: baseline !important;
        border-bottom: none !important;
        text-transform: none !important;
        letter-spacing: normal !important;
        font-size: 11pt !important;
        margin: 3pt 0 0 0 !important;
        padding: 0 !important;
      }
      .jakes-resume-preview p.pdf-meta-row {
        display: flex !important;
        justify-content: space-between !important;
        align-items: baseline !important;
        font-size: 10pt !important;
        padding: 0 !important;
      }
    </style>
  </head>
  <body>
    <div class="${type === "COVER_LETTER" ? "jakes-resume-preview cover-letter-preview" : "jakes-resume-preview"}">
      ${htmlContent}
    </div>
  </body>
</html>`);
  iframeDoc.close();

  await new Promise((resolve) => setTimeout(resolve, 300));

  for (const h3 of iframeDoc.querySelectorAll(".jakes-resume-preview h3")) {
    h3.classList.add(h3.querySelector(".spacer") ? "pdf-job-title" : "pdf-section-header");
  }
  for (const p of iframeDoc.querySelectorAll(".jakes-resume-preview p")) {
    if (p.querySelector(".spacer")) {
      p.classList.add("pdf-meta-row");
    }
  }

  const body = iframeDoc.body;
  const contentHeight = body.scrollHeight;
  iframe.style.height = `${contentHeight}px`;

  await new Promise((resolve) => requestAnimationFrame(resolve));

  try {
    const resumeEl = iframeDoc.querySelector(".jakes-resume-preview") as HTMLElement | null;
    if (!resumeEl) {
      document.body.removeChild(iframe);
      throw new Error("Resume element not found in iframe");
    }

    const canvas = await html2canvas(resumeEl, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      windowWidth: LETTER_PX,
      width: LETTER_PX,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "letter" });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    let yOffset = 0;
    while (yOffset < imgHeight) {
      if (yOffset > 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, -yOffset, imgWidth, imgHeight);
      yOffset += pageHeight;
    }

    pdf.save(name.endsWith(".pdf") ? name : `${name}.pdf`);
  } finally {
    document.body.removeChild(iframe);
  }
}

// Strip a trailing .pdf so we can append `-vN` consistently before re-adding
// the extension. Avoids names like "Resume.pdf-v2.pdf".
function appendVersionSuffix(name: string, versionNumber?: number): string {
  if (versionNumber === undefined) return name;
  const stem = name.replace(/\.pdf$/i, "");
  return `${stem}-v${versionNumber}`;
}

export async function downloadDoc(
  doc: DocumentResponse,
  signedUrl?: string | null,
  versionContent?: string,
  versionNumber?: number
) {
  if (doc.status === "UPLOADED") {
    // UPLOADED docs only ever have one version (storage object is shared);
    // historical content for them is not stored, so the version override
    // is meaningless here. We still apply the suffix in case the caller
    // passed one — keeps filenames self-describing.
    const baseName = appendVersionSuffix(doc.name, versionNumber);
    if (signedUrl) {
      await downloadUploaded(baseName, signedUrl);
    } else {
      await downloadUploadedById(baseName, doc.id);
    }
    return;
  }

  // Generated/markdown docs: prefer the explicit selected-version content
  // when supplied; fall back to doc.content (the latest version) otherwise.
  const content = versionContent ?? doc.content ?? "";
  const fileName = appendVersionSuffix(doc.name, versionNumber);
  await downloadGenerated(fileName, doc.type, content);
}

export function DownloadButton({
  doc,
  signedUrl,
  versionContent,
  versionNumber,
}: DownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    setDownloading(true);
    try {
      await downloadDoc(doc, signedUrl, versionContent, versionNumber);
    } catch {
      showToast("Download failed", "error");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={downloading}
      className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 disabled:opacity-50 text-zinc-50 px-4 py-2 rounded-md text-sm font-medium"
    >
      {downloading ? "Downloading..." : "Download PDF"}
    </button>
  );
}
