import type {
  ChatCompletionRequest,
  ChatMessage,
  ChatMessageContentPart,
} from './chat.types';

export class ChatMessageDto implements ChatMessage {
  role!: string;
  content!: string | ChatMessageContentPart[];
  name?: string;
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
  user?: string;
}
