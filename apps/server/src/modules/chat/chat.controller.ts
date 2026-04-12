import { Body, Controller, HttpStatus, Inject, Post, Res } from '@nestjs/common';

import { ChatService } from './chat.service';
import { ChatCompletionRequestDto } from './chat.dto';

@Controller('chat')
export class ChatController {
  constructor(@Inject(ChatService) private readonly chatService: ChatService) {}

  @Post('completions')
  async createCompletion(
    @Body() body: ChatCompletionRequestDto,
    @Res() response: any,
  ) {
    if (body.stream) {
      await this.chatService.streamCompletion(body, response);
      return;
    }

    const result = await this.chatService.createCompletion(body);
    response.status(HttpStatus.OK).json(result);
  }
}
