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

export async function downloadGenerated(name: string, type: string, content: string) {
  const { default: html2canvas } = await import("html2canvas");
  const { default: jsPDF } = await import("jspdf");
  const { remark } = await import("remark");
  const { default: remarkHtml } = await import("remark-html");

  //converts markdown to html
  const result = await remark().use(remarkHtml, { sanitize: false }).process(content);
  const htmlContent = String(result);

  //fetching the css from public to use in iframe
  const cssRes = await fetch("/jakes-resume.css");
  const cssText = cssRes.ok ? await cssRes.text() : "";

  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position: fixed; left: -9999px; top: 0; width: 816px; height: 1px; border: none;";
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument;
  if (!iframeDoc) return;
  iframeDoc.open();
  iframeDoc.write(`
    <!DOCTYPE html>
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
    </html>
  `);
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

export function DownloadButton({ doc, signedUrl }: DownloadButtonProps) {
    const [downloading, setDownloading] = useState(false);

    async function handleDownload() {
        setDownloading(true);
        try {
            if (doc.status === "UPLOADED") {
                await downloadUploaded(doc.name, signedUrl);
            } else {
                await downloadGenerated(doc.name, doc.type, doc.content ?? "");
            }
        } catch (err) {
            console.error(err)
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