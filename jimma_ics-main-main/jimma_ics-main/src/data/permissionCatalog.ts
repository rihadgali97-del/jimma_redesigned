import permissionCatalogData from '../../../permissions/permissionCatalog.json';
import { PermissionCategory } from '../types';

export const permissionCategories = permissionCatalogData.categories as PermissionCategory[];
export const legacyPermissionAliases: Record<string, string[]> = permissionCatalogData.legacyAliases;

export const canonicalPermissionIds = new Set(
  permissionCategories.flatMap((category) => category.permissions.map((permission) => permission.id))
);

export function normalizeKnownPermissions(permissions: string[]): string[] {
  return [...new Set(permissions.flatMap((permission) => (
    canonicalPermissionIds.has(permission)
      ? [permission]
      : legacyPermissionAliases[permission] || []
  )))];
}
