"use client";

import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface PdfViewerProps {
  url: string;
}

export function PdfViewer({ url }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setContainerWidth(entry.contentRect.width);
    });

    observer.observe(el);
    setContainerWidth(el.clientWidth);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full overflow-y-auto max-h-[800px] rounded-md bg-zinc-950">
      <Document
        file={url}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        loading={
          <div className="flex items-center justify-center h-48 text-zinc-500 text-sm">
            Loading PDF…
          </div>
        }
        error={
          <div className="flex items-center justify-center h-48 text-red-400 text-sm">
            Failed to load PDF.
          </div>
        }
      >
        {Array.from({ length: numPages }, (_, i) => {
          const pageNumber = i + 1;

          return (
            <div key={`page-${pageNumber}`} className="flex justify-center mb-2 last:mb-0">
              <Page
                pageNumber={pageNumber}
                width={containerWidth > 0 ? containerWidth - 32 : undefined}
                renderTextLayer
                renderAnnotationLayer
                loading={
                  <div
                    className="bg-zinc-800 animate-pulse rounded"
                    style={{
                      width: containerWidth > 0 ? containerWidth - 32 : 600,
                      height: 800,
                    }}
                  />
                }
              />
            </div>
          );
        })}
      </Document>
    </div>
  );
}
