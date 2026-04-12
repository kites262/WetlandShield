export type ChatMessageRole = 'system' | 'user' | 'assistant' | 'tool';

export type ChatMessageContentPart = {
  type?: string;
  text?: string;
  [key: string]: unknown;
};

export type ChatMessageContent = string | ChatMessageContentPart[];

export interface ChatMessage {
  role: ChatMessageRole | string;
  content: ChatMessageContent;
  name?: string;
}

export interface ChatCompletionRequest {
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
  stream?: boolean;
  stream_options?: Record<string, unknown>;
  user?: string;
}

export type ChatCompletionResponse = Record<string, unknown>;

export type OpenAIErrorResponse = {
  error: {
    message: string;
    type?: string;
    param?: string | null;
    code?: string | null;
  };
};
