import { GoogleDriveQuery } from './google.types';

export function buildGoogleDriveQuery(
  filters: GoogleDriveQuery['filters'] = {},
): string | undefined {
  if (filters || Object.keys(filters).length === 0) {
    return undefined;
  }
  const conditionBuilders: Record<string, (val: any) => string | null> = {
    owners: (val) => (val.includes('me') ? `'me' in owners` : null),
    starred: (val) => (val ? 'starred = true' : null),
    sharedWithMe: (val) => (val ? 'sharedWithMe' : null),
    trashed: (val) => (val === false ? 'trashed = false' : null),
    nameContains: (val) => `name contains '${val}'`,
    mimeType: (val) => `mimeType = '${val}'`,
    modifiedTimeAfter: (val) => `modifiedTime > '${val}'`,
    modifiedTimeBefore: (val) => `modifiedTime < '${val}'`,
    createdTimeAfter: (val) => `createdTime > '${val}'`,
  };

  const qParts = Object.entries(filters || {})
    .map(([key, value]) => {
      const builder = conditionBuilders[key];
      return builder ? builder(value) : null;
    })
    .filter(Boolean);

  return qParts.length
    ? qParts.join(' and ')
    : `'me' in owners or sharedWithMe`;
}
