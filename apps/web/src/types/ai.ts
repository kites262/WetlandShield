export type OpenAIContentPart = {
  type?: string
  text?: string
}

export type OpenAIChatCompletionChunk = {
  choices?: Array<{
    delta?: {
      content?: string | OpenAIContentPart[]
    }
    message?: {
      content?: string | OpenAIContentPart[]
    }
    text?: string
  }>
  error?: {
    message?: string
  }
}

export type OpenAIChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | OpenAIContentPart[]
    }
    text?: string
  }>
  error?: {
    message?: string
  }
}
