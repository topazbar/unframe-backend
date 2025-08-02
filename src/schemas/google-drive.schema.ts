import { z } from 'zod';

export const GoogleDriveQuerySchema = z.object({
  filters: z
    .object({
      owners: z.array(z.string()).optional(),
      starred: z.boolean().optional(),
      trashed: z.boolean().optional(),
      pageSize: z.number().optional(),
      sharedWithMe: z.boolean().optional(),
      nameContains: z.string().optional(),
      mimeType: z.string().optional(),
      modifiedTimeAfter: z.string().optional(),
      modifiedTimeBefore: z.string().optional(),
      createdTimeAfter: z.string().optional(),
    })
    .optional(),
  fields: z
    .array(
      z.enum([
        'id',
        'name',
        'mimeType',
        'owners',
        'modifiedTime',
        'createdTime',
        'starred',
        'size',
        'trashed',
        'shared',
        'webViewLink',
      ]),
    )
    .optional(),
});
