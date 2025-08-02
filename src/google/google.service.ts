import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import {
  GOOGLE_URL_GET_FILES,
  LIMIT_RESULT_GOOGLE_DRIVE,
} from './google.consts';
import { firstValueFrom, retry } from 'rxjs';
import { DriveFile, DriveResponse, GoogleDriveQuery } from './google.types';
import { UserStateService } from 'src/user-state/user-state.service';
import { buildGoogleDriveQuery } from './google-utils';

@Injectable()
export class GoogleService {
  constructor(
    private readonly httpService: HttpService,
    private readonly userStateService: UserStateService,
  ) {}
  async fetchDriveFiles(params: {
    userEmail: string;
    accessToken: string;
    filters?: GoogleDriveQuery['filters'];
    fields?: GoogleDriveQuery['fields'];
    pageToken?: string;
  }): Promise<DriveFile[]> {
    const {
      userEmail,
      accessToken,
      filters,
      fields,
      pageToken: initialPageToken,
    } = params;

    if (
      Object.keys(filters ?? {}).length == 0 &&
      Object.keys(fields ?? {}).length == 0
    ) {
      return [];
    }
    const allFiles: DriveFile[] = [];
    const q = buildGoogleDriveQuery(filters ?? {});
    const fieldList = fields?.join(',') || 'id,name,owners,modifiedTime';
    const pageToken =
      this.userStateService.getPaginationByProvider(userEmail, 'googleDrive') ??
      undefined;

    try {
      const result = this.httpService
        .get(GOOGLE_URL_GET_FILES, {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: {
            pageSize: filters?.pageSize ?? LIMIT_RESULT_GOOGLE_DRIVE,
            q,
            pageToken,
            fields: `nextPageToken, files(${fieldList})`,
          },
        })
        .pipe(retry(3));

      const { files, nextPageToken } = (await firstValueFrom(result))
        .data as DriveResponse;
      allFiles.push(...files);

      const userLimit = filters?.pageSize;

      const hasMoreResult =
        userLimit !== undefined && (files?.length ?? 0) < userLimit;

      if (hasMoreResult && nextPageToken) {
        this.userStateService.setPaginationByProvider(
          userEmail,
          'googleDrive',
          nextPageToken,
        );
      }
      return allFiles;
    } catch (e) {
      console.error('Error Fetching Drive Files:', e.message);
      throw new Error('Error Fetching Drive Files ' + e.message);
    }
  }

  async searchFilesByAiQuery(
    userEmail: string,
    query: GoogleDriveQuery,
  ): Promise<DriveFile[]> {
    const accessToken = this.userStateService.getAccessByEmail(userEmail);
    return this.fetchDriveFiles({
      userEmail,
      accessToken,
      filters: query?.filters,
      fields: query?.fields,
    });
  }
}
