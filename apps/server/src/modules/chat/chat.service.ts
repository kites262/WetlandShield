import {
  BadGatewayException,
  BadRequestException,
  GatewayTimeoutException,
  HttpException,
  Injectable,
  Logger,
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

const sensitiveKeyPattern =
  /authorization|api[-_ ]?key|(^|[-_ ])token($|[-_ ])|secret|password|credential|session|cookie/i;

function redactSecretsInText(text: string) {
  return text
    .replace(/Bearer\s+[^\s,}]+/gi, 'Bearer [REDACTED]')
    .replace(/sk-[A-Za-z0-9_-]+/g, 'sk-[REDACTED]')
    .replace(
      /(api[-_ ]?key["']?\s*[:=]\s*["']?)[^"',\s}]+/gi,
      '$1[REDACTED]',
    )
    .replace(
      /(token["']?\s*[:=]\s*["']?)[^"',\s}]+/gi,
      '$1[REDACTED]',
    );
}

function sanitizeDebugValue(value: unknown, key = ''): unknown {
  if (sensitiveKeyPattern.test(key)) {
    return '[REDACTED]';
  }

  if (typeof value === 'string') {
    return redactSecretsInText(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeDebugValue(item));
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([entryKey, entryValue]) => [
        entryKey,
        sanitizeDebugValue(entryValue, entryKey),
      ]),
    );
  }

  return value;
}

function headersToRecord(headers: Headers) {
  const result: Record<string, string> = {};
  headers.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

function formatDebugPayload(payload: unknown) {
  try {
    return JSON.stringify(sanitizeDebugValue(payload), null, 2);
  } catch (error) {
    return JSON.stringify({
      error:
        error instanceof Error
          ? error.message
          : 'Failed to format debug payload',
    });
  }
}

function createDebugRequestId() {
  return `${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    message: String(error),
  };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isContentPartArray(value: unknown): value is ChatMessageContentPart[] {
  return (
    Array.isArray(value) &&
    value.every((item) => isPlainObject(item))
  );
}

function isMessageContent(
  value: unknown,
): value is ChatMessage['content'] {
  return (
    typeof value === 'string' ||
    value === null ||
    isContentPartArray(value)
  );
}

function hasMessageContent(value: unknown) {
  return typeof value === 'string' || isContentPartArray(value);
}

function validateRequiredContent(
  message: Record<string, unknown>,
  index: number,
) {
  if (!Object.prototype.hasOwnProperty.call(message, 'content')) {
    throw new BadRequestException(`messages[${index}].content is required`);
  }

  if (!isMessageContent(message.content) || message.content === null) {
    throw new BadRequestException(
      `messages[${index}].content must be a string or content part array`,
    );
  }
}

function validateOptionalContent(
  message: Record<string, unknown>,
  index: number,
) {
  if (
    !Object.prototype.hasOwnProperty.call(message, 'content') ||
    message.content === undefined
  ) {
    return false;
  }

  if (!isMessageContent(message.content)) {
    throw new BadRequestException(
      `messages[${index}].content must be a string, content part array, or null`,
    );
  }

  return hasMessageContent(message.content);
}

function validateToolCalls(message: Record<string, unknown>, index: number) {
  if (
    !Object.prototype.hasOwnProperty.call(message, 'tool_calls') ||
    message.tool_calls === undefined
  ) {
    return false;
  }

  if (
    !Array.isArray(message.tool_calls) ||
    !message.tool_calls.every((toolCall) => isPlainObject(toolCall))
  ) {
    throw new BadRequestException(
      `messages[${index}].tool_calls must be an array of objects`,
    );
  }

  return message.tool_calls.length > 0;
}

function validateToolMessage(message: Record<string, unknown>, index: number) {
  validateRequiredContent(message, index);

  if (
    typeof message.tool_call_id !== 'string' ||
    !message.tool_call_id.trim()
  ) {
    throw new BadRequestException(
      `messages[${index}].tool_call_id is required for tool messages`,
    );
  }
}

function validateAssistantMessage(
  message: Record<string, unknown>,
  index: number,
) {
  const hasContent = validateOptionalContent(message, index);
  const hasToolCalls = validateToolCalls(message, index);
  const hasFunctionCall = isPlainObject(message.function_call);

  if (!hasContent && !hasToolCalls && !hasFunctionCall) {
    throw new BadRequestException(
      `messages[${index}] must include content, tool_calls, or function_call`,
    );
  }
}

function validateToolDefinitions(body: ChatCompletionRequestDto) {
  if (body.tools === undefined) {
    return;
  }

  if (
    !Array.isArray(body.tools) ||
    !body.tools.every((tool) => isPlainObject(tool))
  ) {
    throw new BadRequestException('tools must be an array of objects');
  }
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

  const role = typeof message.role === 'string' ? message.role.trim() : '';

  if (!role) {
    throw new BadRequestException(`messages[${index}].role is required`);
  }

  if (role === 'assistant') {
    validateAssistantMessage(message, index);
    return;
  }

  if (role === 'tool') {
    validateToolMessage(message, index);
    return;
  }

  validateRequiredContent(message, index);
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
  validateToolDefinitions(body);
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  private logAiDebug(event: string, payload: unknown) {
    if (!config.aiDebug) {
      return;
    }

    this.logger.log(`[AI_DEBUG] ${event}\n${formatDebugPayload(payload)}`);
  }

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

    const requestModel = typeof body.model === 'string' ? body.model.trim() : '';
    const model = requestModel || config.aiModel;

    if (!model) {
      throw new BadRequestException('model is required');
    }

    this.logAiDebug('model resolved', {
      requestModel: requestModel || null,
      defaultModel: config.aiModel || null,
      resolvedModel: model,
      usedDefaultModel: !requestModel,
      stream,
    });

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
    requestId: string,
  ): Promise<Response> {
    const url = `${config.aiBaseUrl}/chat/completions`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.aiApiKey}`,
    };
    const startedAt = Date.now();

    this.logAiDebug('upstream request', {
      requestId,
      method: 'POST',
      url,
      timeoutMs: config.aiTimeoutMs,
      headers,
      body,
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal,
      });

      this.logAiDebug('upstream response headers', {
        requestId,
        elapsedMs: Date.now() - startedAt,
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: headersToRecord(response.headers),
      });

      return response;
    } catch (error) {
      this.logAiDebug('upstream request error', {
        requestId,
        elapsedMs: Date.now() - startedAt,
        error: serializeError(error),
      });

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
    requestId: string,
  ): Promise<ChatCompletionResponse> {
    const rawText = await response.text();
    const payload = parseJsonPayload(rawText);

    this.logAiDebug('upstream response body', {
      requestId,
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: headersToRecord(response.headers),
      rawText,
      parsed: payload,
    });

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
    const requestId = createDebugRequestId();
    const requestBody = this.prepareRequestBody(body, false);
    const response = await this.requestUpstream(
      requestBody,
      this.createRequestSignal(),
      requestId,
    );

    return this.parseJsonResponse(response, requestId);
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
      const requestId = createDebugRequestId();
      const requestBody = this.prepareRequestBody(body, true);
      let upstreamResponse: Response;

      try {
        upstreamResponse = await this.requestUpstream(
          requestBody,
          this.createRequestSignal([clientAbortController.signal]),
          requestId,
        );
      } catch (error) {
        if (clientAbortController.signal.aborted) {
          this.logAiDebug('stream aborted before upstream response', {
            requestId,
          });
          return;
        }

        throw error;
      }

      if (!upstreamResponse.ok) {
        await this.parseJsonResponse(upstreamResponse, requestId);
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
      const decoder = config.aiDebug ? new TextDecoder() : null;
      let chunkIndex = 0;
      let totalBytes = 0;

      try {
        while (!clientAbortController.signal.aborted) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          if (!value || value.length === 0) {
            continue;
          }

          chunkIndex += 1;
          totalBytes += value.length;

          this.logAiDebug('upstream stream chunk', {
            requestId,
            chunkIndex,
            byteLength: value.length,
            text: decoder?.decode(value, { stream: true }),
          });

          if (!response.write(Buffer.from(value))) {
            await this.waitForDrain(response);
          }
        }
      } catch (error) {
        this.logAiDebug('upstream stream error', {
          requestId,
          chunkIndex,
          totalBytes,
          error: serializeError(error),
        });

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
        const trailingText = decoder?.decode();
        if (trailingText) {
          this.logAiDebug('upstream stream trailing text', {
            requestId,
            text: trailingText,
          });
        }

        this.logAiDebug('upstream stream complete', {
          requestId,
          chunkCount: chunkIndex,
          totalBytes,
          clientAborted: clientAbortController.signal.aborted,
        });

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
