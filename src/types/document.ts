export type DocumentType = "RESUME" | "COVER_LETTER" | "OTHER";
export type DocumentStatus = "DRAFT" | "READY" | "ARCHIVED" | "UPLOADED";

export type DocumentResponse = {
  id: string;
  type: DocumentType;
  name: string;
  status: DocumentStatus;
  tags: string[];
  content?: string;
  fileUrl?: string;
  documentVersionId?: string;
  versionNumber: number;
  createdAt: string;
  updatedAt: string;
  // Present only on responses from `GET /api/jobs/:id/documents`. Indicates
  // that the document has been edited since it was linked to the job, so the
  // UI can surface a "newer version available" hint and offer a re-link path.
  hasNewerVersion?: boolean;
  latestVersionNumber?: number;
  linkedAt?: string;
};

export type DocumentVersionResponse = {
  id: string;
  versionNumber: number;
  content?: string;
  createdAt: string;
};
