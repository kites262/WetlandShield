import { config } from '@/config';
import type {
  ActionRecordMutationResponse,
  ConfirmAbnormalMutationResponse,
  RecordsSnapshot,
} from '@/types/records';

export type ConfirmAbnormalPayload = {
  region: string;
  confirmer: string;
};

export type RecordActionPayload = {
  measures: string;
};

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as {
      error?: {
        message?: string;
      };
      message?: string;
    };

    if (typeof data?.error?.message === 'string' && data.error.message.trim()) {
      return data.error.message.trim();
    }

    if (typeof data?.message === 'string' && data.message.trim()) {
      return data.message.trim();
    }
  } catch {
    // Ignore parse failure and fall through to the HTTP status message.
  }

  return `Request failed: ${response.status}`;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${config.apiBase}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return (await response.json()) as T;
}

export function fetchCurrentRecords() {
  return requestJson<RecordsSnapshot>('/records/current');
}

export function createConfirmAbnormal(payload: ConfirmAbnormalPayload) {
  return requestJson<ConfirmAbnormalMutationResponse>(
    '/records/confirm-abnormal',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
}

export function createActionRecord(payload: RecordActionPayload) {
  return requestJson<ActionRecordMutationResponse>('/records/record-action', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
