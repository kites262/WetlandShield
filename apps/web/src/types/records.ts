export type ConfirmAbnormalRecord = {
  id: string
  type: 'confirm_abnormal'
  region: string
  confirmer: string
  time: string
}

export type ActionRecord = {
  id: string
  type: 'action_taken'
  measures: string
  time: string
}

export type RecordsStatus = {
  abnormalConfirmed: boolean
  actionRecorded: boolean
  pendingAction: boolean
  confirmCount: number
  actionCount: number
  currentRegion: string | null
  lastConfirmer: string | null
  lastConfirmAt: string | null
  lastActionAt: string | null
  updatedAt: string | null
}

export type RecordsSnapshot = {
  status: RecordsStatus
  records: {
    confirmations: ConfirmAbnormalRecord[]
    actions: ActionRecord[]
  }
}

export type ConfirmAbnormalMutationResponse = {
  record: ConfirmAbnormalRecord
  snapshot: RecordsSnapshot
}

export type ActionRecordMutationResponse = {
  record: ActionRecord
  snapshot: RecordsSnapshot
}
