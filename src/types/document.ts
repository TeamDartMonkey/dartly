export type DocumentType = "RESUME" | "COVER_LETTER" | "OTHER";
export type DocumentStatus = "DRAFT" | "READY" | "ARCHIVED" | "UPLOADED";

export type DocumentResponse = {
  id: string;
  type: DocumentType;
  name: string;
  status: DocumentStatus;
  content?: string;
  fileUrl?: string;
  documentVersionId?: string;
  versionNumber: number;
  createdAt: string;
  updatedAt: string;
};

export type DocumentVersionResponse = {
  id: string;
  versionNumber: number;
  content?: string;
  createdAt: string;
};
