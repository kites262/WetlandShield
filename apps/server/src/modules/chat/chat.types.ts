export type ChatMessageRole =
  | 'developer'
  | 'system'
  | 'user'
  | 'assistant'
  | 'tool'
  | 'function';

export type ChatMessageContentPart = {
  type?: string;
  text?: string;
  [key: string]: unknown;
};

export type ChatMessageContent = string | ChatMessageContentPart[] | null;

export type ChatToolCall = {
  id?: string;
  type?: string;
  function?: {
    name?: string;
    arguments?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

export type ChatTool = {
  type: string;
  function?: {
    name?: string;
    description?: string;
    parameters?: Record<string, unknown>;
    strict?: boolean;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

export type ChatToolChoice =
  | 'none'
  | 'auto'
  | 'required'
  | Record<string, unknown>;

export interface ChatMessage {
  role: ChatMessageRole | string;
  content?: ChatMessageContent;
  name?: string;
  tool_call_id?: string;
  tool_calls?: ChatToolCall[];
  function_call?: Record<string, unknown>;
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
  stop?: string | string[];
  max_completion_tokens?: number;
  response_format?: Record<string, unknown>;
  tools?: ChatTool[];
  tool_choice?: ChatToolChoice;
  parallel_tool_calls?: boolean;
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
