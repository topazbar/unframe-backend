import { z } from 'zod';
export const GmailQuerySchema = z
  .object({
    filters: z
      .object({
        from: z.string().email().optional(),
        to: z.string().email().optional(),
        maxResults: z.number().optional(),
        cc: z.string().email().optional(),
        query: z.string().optional(),
        q: z.string().optional(),
        bcc: z.string().email().optional(),
        subject: z.string().optional(),
        subjectContains: z.string().optional(),
        after: z.string().optional(), // e.g. '2024/01/01'
        before: z.string().optional(),
        olderThan: z.string().optional(), // e.g. '1d', '2m'
        newerThan: z.string().optional(),
        hasAttachment: z.boolean().optional(),
        filename: z.string().optional(), // e.g. 'report.pdf'
        label: z.string().optional(), // e.g. 'IMPORTANT'
        isUnread: z.boolean().optional(),
        isStarred: z.boolean().optional(),
        in: z
          .union([
            z.literal('inbox'),
            z.literal('sent'),
            z.literal('spam'),
            z.literal('trash'),
            z.string(),
          ])
          .optional(),
        category: z
          .union([
            z.literal('primary'),
            z.literal('promotions'),
            z.literal('social'),
            z.string(),
          ])
          .optional(),
        rawText: z.string().optional(),
        hasDriveLinks: z.boolean().optional(), // השדה שהיה קיים אצלך קודם
      })
      .optional(),

    headers: z
      .array(z.enum(['From', 'To', 'Subject', 'Date', 'Cc', 'Bcc']))
      .optional(),
  })
  .optional();
