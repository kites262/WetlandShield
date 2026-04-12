import {
  BadGatewayException,
  BadRequestException,
  GatewayTimeoutException,
  HttpException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';

import { config } from '../../config';
import { ChatCompletionRequestDto } from './chat.dto';
import type {
  ChatCompletionResponse,
  ChatMessage,
  ChatMessageContentPart,
  OpenAIErrorResponse,
} from './chat.types';

type StreamingResponse = {
  headersSent: boolean;
  writableEnded: boolean;
  flushHeaders?: () => void;
  status: (code: number) => StreamingResponse;
  json: (body: unknown) => unknown;
  setHeader: (name: string, value: string) => void;
  write: (chunk: Buffer) => boolean;
  end: () => void;
  on: (event: string, listener: () => void) => StreamingResponse;
  off: (event: string, listener: () => void) => StreamingResponse;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isContentPartArray(value: unknown): value is ChatMessageContentPart[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((item) => isPlainObject(item))
  );
}

function extractErrorMessage(
  payload: unknown,
  fallback: string,
): OpenAIErrorResponse {
  if (isPlainObject(payload)) {
    const nestedError = payload.error;

    if (isPlainObject(nestedError) && typeof nestedError.message === 'string') {
      return {
        error: {
          message: nestedError.message,
          type:
            typeof nestedError.type === 'string' ? nestedError.type : undefined,
          param:
            typeof nestedError.param === 'string' || nestedError.param === null
              ? nestedError.param
              : undefined,
          code:
            typeof nestedError.code === 'string' || nestedError.code === null
              ? nestedError.code
              : undefined,
        },
      };
    }

    if (typeof payload.message === 'string') {
      return {
        error: {
          message: payload.message,
        },
      };
    }
  }

  return {
    error: {
      message: fallback,
    },
  };
}

function parseJsonPayload(text: string) {
  if (!text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function validateMessage(message: unknown, index: number): asserts message is ChatMessage {
  if (!isPlainObject(message)) {
    throw new BadRequestException(`messages[${index}] must be an object`);
  }

  if (typeof message.role !== 'string' || !message.role.trim()) {
    throw new BadRequestException(`messages[${index}].role is required`);
  }

  const { content } = message;
  const isValidContent =
    (typeof content === 'string' && content.trim().length > 0) ||
    isContentPartArray(content);

  if (!isValidContent) {
    throw new BadRequestException(
      `messages[${index}].content must be a non-empty string or content part array`,
    );
  }
}

function validateRequestBody(
  body: ChatCompletionRequestDto,
): asserts body is ChatCompletionRequestDto & { messages: ChatMessage[] } {
  if (!isPlainObject(body)) {
    throw new BadRequestException('Request body must be a JSON object');
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    throw new BadRequestException('messages must be a non-empty array');
  }

  body.messages.forEach((message, index) => validateMessage(message, index));
}

@Injectable()
export class ChatService {
  private prepareRequestBody(
    body: ChatCompletionRequestDto,
    stream = false,
  ): ChatCompletionRequestDto & { messages: ChatMessage[]; model: string } {
    validateRequestBody(body);

    if (!config.aiBaseUrl || !config.aiApiKey) {
      throw new ServiceUnavailableException({
        error: {
          message:
            'AI upstream is not configured. Please set AI_BASE_URL and AI_API_KEY.',
        },
      });
    }

    const model = config.aiModel || body.model?.trim();

    if (!model) {
      throw new BadRequestException('model is required');
    }

    return {
      ...body,
      model,
      stream,
    };
  }

  private createRequestSignal(extraSignals: AbortSignal[] = []) {
    const timeoutSignal = AbortSignal.timeout(config.aiTimeoutMs);
    return extraSignals.length > 0
      ? AbortSignal.any([timeoutSignal, ...extraSignals])
      : timeoutSignal;
  }

  private async requestUpstream(
    body: ChatCompletionRequestDto,
    signal: AbortSignal,
  ): Promise<Response> {
    try {
      return await fetch(`${config.aiBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.aiApiKey}`,
        },
        body: JSON.stringify(body),
        signal,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError') {
        throw new GatewayTimeoutException({
          error: {
            message: `AI upstream request timed out after ${config.aiTimeoutMs}ms`,
          },
        });
      }

      throw new BadGatewayException({
        error: {
          message:
            error instanceof Error
              ? error.message
              : 'Failed to connect to AI upstream',
        },
      });
    }
  }

  private async parseJsonResponse(
    response: Response,
  ): Promise<ChatCompletionResponse> {
    const rawText = await response.text();
    const payload = parseJsonPayload(rawText);

    if (!response.ok) {
      throw new HttpException(
        extractErrorMessage(
          payload,
          rawText.trim() || `AI upstream request failed with ${response.status}`,
        ),
        response.status,
      );
    }

    if (!payload || !isPlainObject(payload)) {
      throw new BadGatewayException({
        error: {
          message: 'AI upstream returned a non-JSON response',
        },
      });
    }

    return payload;
  }

  private applyStreamHeaders(
    upstreamResponse: Response,
    response: StreamingResponse,
  ) {
    response.status(upstreamResponse.status);
    response.setHeader(
      'Content-Type',
      upstreamResponse.headers.get('content-type') ?? 'text/event-stream; charset=utf-8',
    );
    response.setHeader('Cache-Control', 'no-cache, no-transform');
    response.setHeader('Connection', 'keep-alive');
    response.setHeader('X-Accel-Buffering', 'no');

    const requestId = upstreamResponse.headers.get('x-request-id');
    if (requestId) {
      response.setHeader('X-Request-Id', requestId);
    }

    response.flushHeaders?.();
  }

  private waitForDrain(response: StreamingResponse): Promise<void> {
    return new Promise((resolve) => {
      const handleDrain = () => {
        response.off('drain', handleDrain);
        response.off('close', handleClose);
        resolve();
      };

      const handleClose = () => {
        response.off('drain', handleDrain);
        response.off('close', handleClose);
        resolve();
      };

      response.on('drain', handleDrain);
      response.on('close', handleClose);
    });
  }

  async createCompletion(
    body: ChatCompletionRequestDto,
  ): Promise<ChatCompletionResponse> {
    const requestBody = this.prepareRequestBody(body, false);
    const response = await this.requestUpstream(
      requestBody,
      this.createRequestSignal(),
    );

    return this.parseJsonResponse(response);
  }

  async streamCompletion(
    body: ChatCompletionRequestDto,
    response: StreamingResponse,
  ): Promise<void> {
    const clientAbortController = new AbortController();
    const handleClientClose = () => {
      clientAbortController.abort();
    };

    response.on('close', handleClientClose);

    try {
      const requestBody = this.prepareRequestBody(body, true);
      let upstreamResponse: Response;

      try {
        upstreamResponse = await this.requestUpstream(
          requestBody,
          this.createRequestSignal([clientAbortController.signal]),
        );
      } catch (error) {
        if (clientAbortController.signal.aborted) {
          return;
        }

        throw error;
      }

      if (!upstreamResponse.ok) {
        await this.parseJsonResponse(upstreamResponse);
        return;
      }

      if (!upstreamResponse.body) {
        throw new BadGatewayException({
          error: {
            message: 'AI upstream returned an empty stream body',
          },
        });
      }

      this.applyStreamHeaders(upstreamResponse, response);

      const reader = upstreamResponse.body.getReader();

      try {
        while (!clientAbortController.signal.aborted) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          if (!value || value.length === 0) {
            continue;
          }

          if (!response.write(Buffer.from(value))) {
            await this.waitForDrain(response);
          }
        }
      } catch (error) {
        if (!clientAbortController.signal.aborted) {
          throw new BadGatewayException({
            error: {
              message:
                error instanceof Error
                  ? error.message
                  : 'Failed to proxy AI stream response',
            },
          });
        }
      } finally {
        reader.releaseLock();
      }
    } finally {
      response.off('close', handleClientClose);

      if (!response.writableEnded) {
        response.end();
      }
    }
  }
}
