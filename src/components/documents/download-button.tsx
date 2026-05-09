"use client";

import { useState } from "react";
import { showToast } from "@/components/ui/toast";
import type { DocumentResponse } from "@/types/document";

interface DownloadButtonProps {
  doc: DocumentResponse;
  signedUrl?: string | null;
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
      "*": [...(defaultSchema.attributes?.["*"] ?? []), "className", "class"],
    },
    tagNames: [...(defaultSchema.tagNames ?? []), "span", "div", "br"],
  };
  const file = await rehype().data("settings", { fragment: true }).use(rehypeSanitize, schema).process(html);
  return String(file);
}

export async function downloadGenerated(name: string, type: string, content: string) {
  const { default: html2canvas } = await import("html2canvas");
  const { default: jsPDF } = await import("jspdf");
  const { remark } = await import("remark");
  const { default: remarkHtml } = await import("remark-html");

  const result = await remark().use(remarkHtml).process(content);
  const htmlContent = await sanitizeResumeHtml(String(result));

  const cssRes = await fetch("/jakes-resume.css");
  const cssText = cssRes.ok ? await cssRes.text() : "";

  const iframe = document.createElement("iframe");
  iframe.style.cssText =
    "position: fixed; left: -9999px; top: 0; width: 816px; height: 1px; border: none;";
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
      body {
        background: #ffffff;
        color: #000000;
        font-family: Georgia, serif;
        font-size: 14px;
        line-height: 1.5;
        padding: 48px;
        width: 816px;
      }
      ${cssText}
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

  const body = iframeDoc.body;
  const contentHeight = body.scrollHeight;
  iframe.style.height = `${contentHeight}px`;

  await new Promise((resolve) => requestAnimationFrame(resolve));

  try {
    const canvas = await html2canvas(body, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      windowWidth: 816,
      width: 816,
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

export async function downloadDoc(doc: DocumentResponse, signedUrl?: string | null) {
  if (doc.status === "UPLOADED") {
    if (signedUrl) {
      await downloadUploaded(doc.name, signedUrl);
    } else {
      await downloadUploadedById(doc.name, doc.id);
    }
  } else {
    await downloadGenerated(doc.name, doc.type, doc.content ?? "");
  }
}

export function DownloadButton({ doc, signedUrl }: DownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    setDownloading(true);
    try {
      await downloadDoc(doc, signedUrl);
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
