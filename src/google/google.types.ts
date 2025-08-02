import { GptAiQuery } from 'src/schemas/gpt-query.schema';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  owners: any[];
}

export interface DriveResponse {
  files: DriveFile[];
  nextPageToken?: string;
}

export type GoogleDriveQuery = NonNullable<GptAiQuery['googleDrive']>;
