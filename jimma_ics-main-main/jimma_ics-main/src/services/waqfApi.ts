import { apiRequest } from './authApi';
import { WaqfAsset, WaqfAssetStatus, WaqfAssetType } from '../types';

type ApiWaqfAsset = Omit<WaqfAsset, 'id'> & { id: number | string };
export type WaqfAssetInput = {
  woredaId: number;
  type: WaqfAssetType;
  status: WaqfAssetStatus;
  locationNote?: string;
  monthlyIncome?: number;
  tenantName?: string;
  tenantContact?: string;
  isPublished: boolean;
  name: { en: string };
  description: { en: string };
};

const mapAsset = (asset: ApiWaqfAsset): WaqfAsset => ({ ...asset, id: String(asset.id) });

async function fetchAll(path: string) {
  const assets: WaqfAsset[] = [];
  for (let page = 1; page <= 50; page += 1) {
    const rows = await apiRequest<ApiWaqfAsset[]>(`${path}?page=${page}&pageSize=100&locale=en`);
    assets.push(...rows.map(mapAsset));
    if (rows.length < 100) break;
  }
  return assets;
}

export const fetchPublicWaqfAssets = () => fetchAll('/transparency/waqf');
export const fetchAdminWaqfAssets = () => fetchAll('/admin/waqf');

export async function uploadWaqfAssetImage(id: string, file: File) {
  const body = new FormData();
  body.append('file', file);
  return apiRequest<{ id: number; url: string; fileName: string; mimeType: string }>(`/admin/waqf/${encodeURIComponent(id)}/image`, { method: 'POST', body });
}

export async function createWaqfAssetRecord(data: WaqfAssetInput): Promise<WaqfAsset> {
  const asset = await apiRequest<ApiWaqfAsset>('/admin/waqf', {
    method: 'POST', body: JSON.stringify(data),
  });
  return mapAsset(asset);
}

export async function updateWaqfAssetRecord(id: string, data: Partial<WaqfAssetInput>): Promise<WaqfAsset> {
  const asset = await apiRequest<ApiWaqfAsset>(`/admin/waqf/${encodeURIComponent(id)}`, {
    method: 'PATCH', body: JSON.stringify(data),
  });
  return mapAsset(asset);
}

export function deleteWaqfAssetRecord(id: string) {
  return apiRequest<void>(`/admin/waqf/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
