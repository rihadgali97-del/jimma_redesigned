import { apiRequest, apiRequestBlob, getApiUrl } from './authApi';

export interface CouncilArchiveDocument {
  id: string;
  title: string;
  category: string;
  description: string | null;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedBy: number | null;
  createdAt: string;
}

export interface CouncilDocumentShare {
  url: string;
  expiresAt: string;
}

type ApiCouncilArchiveDocument = Omit<CouncilArchiveDocument, 'id'> & { id: number | string };

function mapDocument(document: ApiCouncilArchiveDocument): CouncilArchiveDocument {
  return { ...document, id: String(document.id) };
}

export async function fetchCouncilArchiveDocuments(): Promise<CouncilArchiveDocument[]> {
  const documents = await apiRequest<ApiCouncilArchiveDocument[]>('/documents/council');
  return documents.map(mapDocument);
}

export async function uploadCouncilArchiveDocument(
  input: { title: string; category: string; description: string; file: File },
): Promise<CouncilArchiveDocument> {
  const body = new FormData();
  body.append('title', input.title);
  body.append('category', input.category);
  body.append('description', input.description);
  body.append('file', input.file);
  const document = await apiRequest<ApiCouncilArchiveDocument>('/documents/council', { method: 'POST', body });
  return mapDocument(document);
}

export async function downloadCouncilArchiveDocument(id: string, fileName: string): Promise<void> {
  const blob = await apiRequestBlob(`/documents/council/${encodeURIComponent(id)}/file`);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function deleteCouncilArchiveDocument(id: string): Promise<void> {
  return apiRequest<void>(`/documents/council/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function createCouncilDocumentShare(id: string): Promise<CouncilDocumentShare> {
  const share = await apiRequest<{ token: string; expiresAt: string }>(
    `/documents/council/${encodeURIComponent(id)}/share-link`,
    { method: 'POST' },
  );
  return {
    url: getApiUrl(`/documents/shared/${encodeURIComponent(share.token)}`),
    expiresAt: share.expiresAt,
  };
}
