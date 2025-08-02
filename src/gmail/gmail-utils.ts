import { GmailQuery } from './gmail.types';

// change to mapping

export function buildGmailQuery(filters: GmailQuery['filters'] = {}): string {
  const qParts: string[] = [];

  if (filters.from) qParts.push(`from:${filters.from}`);
  if (filters.to) qParts.push(`to:${filters.to}`);
  if (filters.cc) qParts.push(`cc:${filters.cc}`);
  if (filters.bcc) qParts.push(`bcc:${filters.bcc}`);

  if (filters.subjectContains)
    qParts.push(`subject:${filters.subjectContains}`);

  if (filters.after) qParts.push(`after:${filters.after.replace(/-/g, '/')}`);
  if (filters.before)
    qParts.push(`before:${filters.before.replace(/-/g, '/')}`);

  if (filters.olderThan) qParts.push(`older_than:${filters.olderThan}`);
  if (filters.newerThan) qParts.push(`newer_than:${filters.newerThan}`);

  if (filters.hasAttachment) qParts.push('has:attachment');
  if (filters.filename) qParts.push(`filename:${filters.filename}`);

  if (filters.label) qParts.push(`label:${filters.label}`);
  if (filters.isUnread) qParts.push('is:unread');
  if (filters.isStarred) qParts.push('is:starred');

  if (filters.in) qParts.push(`in:${filters.in}`);
  if (filters.category) qParts.push(`category:${filters.category}`);

  if (filters.rawText) qParts.push(filters.rawText);

  return qParts.join(' ');
}
