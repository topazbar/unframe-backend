import { z } from 'zod';
import { GoogleDriveQuerySchema } from './google-drive.schema';
import { GmailQuerySchema } from './gmail.schema';

export const GptAiQuerySchema = z.object({
  googleDrive: GoogleDriveQuerySchema.optional(),
  gmail: GmailQuerySchema.optional(),
  trello: z.any().optional(),
});

export type GptAiQuery = z.infer<typeof GptAiQuerySchema>;
