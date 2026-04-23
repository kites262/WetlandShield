import type {
  ChatCompletionRequest,
  ChatMessage,
  ChatMessageContent,
  ChatTool,
  ChatToolCall,
  ChatToolChoice,
} from './chat.types';

export class ChatMessageDto implements ChatMessage {
  role!: string;
  content?: ChatMessageContent;
  name?: string;
  tool_call_id?: string;
  tool_calls?: ChatToolCall[];
  function_call?: Record<string, unknown>;
}

export class ChatCompletionRequestDto implements ChatCompletionRequest {
  model?: string;
  messages!: ChatMessageDto[];
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
