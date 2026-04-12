import { randomUUID } from 'node:crypto';

import { BadRequestException, Injectable } from '@nestjs/common';

import type {
  ActionRecord,
  ActionRecordMutationResponse,
  ConfirmAbnormalMutationResponse,
  ConfirmAbnormalRecord,
  RecordsSnapshot,
} from './records.types';
import type {
  CreateActionRecordDto,
  CreateConfirmAbnormalRecordDto,
} from './records.dto';

function normalizeRequiredString(value: unknown, field: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new BadRequestException(`${field} is required`);
  }

  return value.trim();
}

@Injectable()
export class RecordsService {
  private readonly confirmations: ConfirmAbnormalRecord[] = [];

  private readonly actions: ActionRecord[] = [];

  private buildSnapshot(): RecordsSnapshot {
    const latestConfirmation = this.confirmations.at(-1) ?? null;
    const latestAction = this.actions.at(-1) ?? null;
    const lastConfirmAt = latestConfirmation?.time ?? null;
    const lastActionAt = latestAction?.time ?? null;
    const updatedAt =
      lastConfirmAt && lastActionAt
        ? lastConfirmAt > lastActionAt
          ? lastConfirmAt
          : lastActionAt
        : lastConfirmAt ?? lastActionAt;
    const pendingAction = Boolean(
      latestConfirmation && (!latestAction || latestAction.time < latestConfirmation.time),
    );

    return {
      status: {
        abnormalConfirmed: this.confirmations.length > 0,
        actionRecorded: this.actions.length > 0,
        pendingAction,
        confirmCount: this.confirmations.length,
        actionCount: this.actions.length,
        currentRegion: latestConfirmation?.region ?? null,
        lastConfirmer: latestConfirmation?.confirmer ?? null,
        lastConfirmAt,
        lastActionAt,
        updatedAt,
      },
      records: {
        confirmations: [...this.confirmations],
        actions: [...this.actions],
      },
    };
  }

  getCurrent(): RecordsSnapshot {
    return this.buildSnapshot();
  }

  createConfirmAbnormal(
    body: CreateConfirmAbnormalRecordDto,
  ): ConfirmAbnormalMutationResponse {
    const record: ConfirmAbnormalRecord = {
      id: randomUUID(),
      type: 'confirm_abnormal',
      region: normalizeRequiredString(body?.region, 'region'),
      confirmer: normalizeRequiredString(body?.confirmer, 'confirmer'),
      time: new Date().toISOString(),
    };

    this.confirmations.push(record);

    return {
      record,
      snapshot: this.buildSnapshot(),
    };
  }

  createActionRecord(body: CreateActionRecordDto): ActionRecordMutationResponse {
    const record: ActionRecord = {
      id: randomUUID(),
      type: 'action_taken',
      measures: normalizeRequiredString(body?.measures, 'measures'),
      time: new Date().toISOString(),
    };

    this.actions.push(record);

    return {
      record,
      snapshot: this.buildSnapshot(),
    };
  }
}
