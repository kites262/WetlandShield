import { appConfig } from '@/config'

export interface SuggestionRequestPayload {
  userInput: string
  presetSuggestion: string
  currentSuggestion?: string
  panelTitle?: string
  dashboardContext?: string[]
}

function readChoiceContent(data: any): string {
  const choice = data?.choices?.[0]
  const content = choice?.message?.content ?? choice?.text

  if (typeof content === 'string') {
    return content.trim()
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => item?.text || item?.content || '')
      .join('')
      .trim()
  }

  return ''
}

function extractSuggestion(data: any): string {
  const candidates = [
    data,
    data?.data,
    data?.result,
  ]

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim()
    }

    const directValue =
      candidate?.suggestion ||
      candidate?.content ||
      candidate?.text ||
      candidate?.answer ||
      candidate?.message

    if (typeof directValue === 'string' && directValue.trim()) {
      return directValue.trim()
    }
  }

  return readChoiceContent(data)
}

export async function requestWarningSuggestion(
  payload: SuggestionRequestPayload,
  signal?: AbortSignal
): Promise<string> {
  const response = await fetch(`${appConfig.apiBaseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'wetland-advisor',
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
    signal,
  })

  if (!response.ok) {
    throw new Error(`AI suggestion request failed: ${response.status}`)
  }

  const data = await response.json()
  const suggestion = extractSuggestion(data)

  if (!suggestion) {
    throw new Error('AI suggestion response is empty')
  }

  return suggestion
}
