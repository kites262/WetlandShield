import { config } from '@/config'
import type {
  OpenAIChatCompletionChunk,
  OpenAIChatCompletionResponse,
  OpenAIContentPart,
} from '@/types/ai'

export interface SuggestionRequestPayload {
  userInput: string
  presetSuggestion: string
  currentSuggestion?: string
  panelTitle?: string
  dashboardContext?: string[]
}

export interface SuggestionStreamOptions {
  signal?: AbortSignal
  onStart?: () => void
  onChunk?: (nextText: string, deltaText: string) => void
  onComplete?: (finalText: string) => void
}

function readMessageContent(content: string | OpenAIContentPart[] | undefined): string {
  if (typeof content === 'string') {
    return content.trim()
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => item?.text || '')
      .join('')
      .trim()
  }

  return ''
}

function extractSuggestion(data: OpenAIChatCompletionResponse): string {
  const choice = data?.choices?.[0]
  const messageContent = readMessageContent(choice?.message?.content)

  if (messageContent) {
    return messageContent
  }

  return typeof choice?.text === 'string' ? choice.text.trim() : ''
}

function extractStreamDelta(data: OpenAIChatCompletionChunk): string {
  const choice = data?.choices?.[0]
  const deltaContent = readMessageContent(choice?.delta?.content)

  if (deltaContent) {
    return deltaContent
  }

  const messageContent = readMessageContent(choice?.message?.content)
  if (messageContent) {
    return messageContent
  }

  return typeof choice?.text === 'string' ? choice.text.trim() : ''
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as OpenAIChatCompletionResponse & {
      message?: string
    }

    if (typeof data?.error?.message === 'string' && data.error.message.trim()) {
      return data.error.message.trim()
    }

    if (typeof data?.message === 'string' && data.message.trim()) {
      return data.message.trim()
    }
  } catch {
    // Ignore JSON parse failures and fall back to HTTP status.
  }

  return `AI suggestion request failed: ${response.status}`
}

function readSseEventData(eventBlock: string): string {
  const dataLines = eventBlock
    .split('\n')
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trimStart())

  return dataLines.join('\n').trim()
}

async function readStreamingSuggestion(
  response: Response,
  options: SuggestionStreamOptions
): Promise<string> {
  if (!response.body) {
    throw new Error('AI suggestion stream is empty')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let suggestion = ''
  let started = false

  try {
    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        buffer += decoder.decode()
        break
      }

      buffer += decoder.decode(value, { stream: true })
      buffer = buffer.replace(/\r\n/g, '\n')

      let boundaryIndex = buffer.indexOf('\n\n')
      while (boundaryIndex !== -1) {
        const rawEvent = buffer.slice(0, boundaryIndex)
        buffer = buffer.slice(boundaryIndex + 2)

        const data = readSseEventData(rawEvent)
        if (!data) {
          boundaryIndex = buffer.indexOf('\n\n')
          continue
        }

        if (data === '[DONE]') {
          options.onComplete?.(suggestion)
          return suggestion
        }

        const chunk = JSON.parse(data) as OpenAIChatCompletionChunk
        if (typeof chunk?.error?.message === 'string' && chunk.error.message.trim()) {
          throw new Error(chunk.error.message.trim())
        }

        const delta = extractStreamDelta(chunk)
        if (!delta) {
          boundaryIndex = buffer.indexOf('\n\n')
          continue
        }

        if (!started) {
          started = true
          options.onStart?.()
        }

        suggestion += delta
        options.onChunk?.(suggestion, delta)
        boundaryIndex = buffer.indexOf('\n\n')
      }
    }
  } finally {
    reader.releaseLock()
  }

  const trailingData = readSseEventData(buffer.replace(/\r\n/g, '\n'))
  if (trailingData && trailingData !== '[DONE]') {
    const chunk = JSON.parse(trailingData) as OpenAIChatCompletionChunk
    const delta = extractStreamDelta(chunk)

    if (delta) {
      if (!started) {
        options.onStart?.()
      }
      suggestion += delta
      options.onChunk?.(suggestion, delta)
    }
  }

  options.onComplete?.(suggestion)
  return suggestion
}

export async function requestWarningSuggestion(
  payload: SuggestionRequestPayload,
  options: SuggestionStreamOptions = {}
): Promise<string> {
  const response = await fetch(`${config.apiBase}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      temperature: 0.6,
      stream: true,
      messages: [
        {
          role: 'system',
          content:
            '你是一名湿地生态监测研判助手，需要基于监测场景给出更具体、更可执行的风险研判建议，输出应适合作为大屏卡片文案。',
        },
        {
          role: 'system',
          content: `当前预置建议为：${payload.presetSuggestion}`,
        },
        {
          role: 'system',
          content: `当前卡片展示内容为：${payload.currentSuggestion || payload.presetSuggestion}`,
        },
        {
          role: 'user',
          content: [
            `面板标题：${payload.panelTitle || '预警研判建议'}`,
            `大屏上下文：${(payload.dashboardContext || []).join('；')}`,
            `用户追问：${payload.userInput}`,
            '请输出一段可直接展示在大屏卡片中的研判建议，不要使用 Markdown 列表。',
          ].join('\n'),
        },
      ],
    }),
    signal: options.signal,
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }

  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('text/event-stream')) {
    const suggestion = await readStreamingSuggestion(response, options)

    if (!suggestion) {
      throw new Error('AI suggestion response is empty')
    }

    return suggestion
  }

  const data = (await response.json()) as OpenAIChatCompletionResponse
  const suggestion = extractSuggestion(data)

  if (!suggestion) {
    throw new Error('AI suggestion response is empty')
  }

  options.onStart?.()
  options.onChunk?.(suggestion, suggestion)
  options.onComplete?.(suggestion)
  return suggestion
}
