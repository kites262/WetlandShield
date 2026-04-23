# API

## POST `/chat/completions`

Proxy an OpenAI-compatible chat completion request to the configured upstream
AI provider.

### Request body

```json
{
  "model": "deepseek-chat",
  "messages": [
    {
      "role": "system",
      "content": "你是一名湿地生态监测研判助手。"
    },
    {
      "role": "user",
      "content": "请给出当前断面的风险建议。"
    }
  ],
  "temperature": 0.6
}
```

### Notes

- Default global prefix is `/api`, so the runtime path is
  `/api/chat/completions`.
- `stream: true` is supported and will proxy upstream SSE chunks directly.
- `tools`, `tool_choice`, `parallel_tool_calls`, `tool_calls`, and
  `tool_call_id` are accepted and proxied for OpenAI-compatible tool use.
- If `AI_MODEL` is configured, it is used only when the incoming request omits
  `model`; client-provided model names are otherwise preserved.

## POST `/records/confirm-abnormal`

Append an anomaly confirmation record to the in-memory store.

### Request body

```json
{
  "region": "北侧入湖口",
  "confirmer": "巡检员A12"
}
```

## POST `/records/record-action`

Append an action handling record to the in-memory store.

### Request body

```json
{
  "measures": "已加密采样并通知上游闸站复核来水情况。"
}
```

## GET `/records/current`

Return the current in-memory snapshot, including all records plus derived
status fields such as `abnormalConfirmed`, `actionRecorded`, and
`pendingAction`.

### Notes

- Default global prefix is `/api`, so runtime paths are `/api/records/*`.
- These records are not persisted. Restarting the server clears them.
