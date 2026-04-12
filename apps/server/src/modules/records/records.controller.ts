import { Body, Controller, Get, Inject, Post } from '@nestjs/common';

import { CreateActionRecordDto, CreateConfirmAbnormalRecordDto } from './records.dto';
import { RecordsService } from './records.service';

@Controller('records')
export class RecordsController {
  constructor(@Inject(RecordsService) private readonly recordsService: RecordsService) {}

  @Get('current')
  getCurrent() {
    return this.recordsService.getCurrent();
  }

  @Post('confirm-abnormal')
  createConfirmAbnormal(@Body() body: CreateConfirmAbnormalRecordDto) {
    return this.recordsService.createConfirmAbnormal(body);
  }

  @Post('record-action')
  createActionRecord(@Body() body: CreateActionRecordDto) {
    return this.recordsService.createActionRecord(body);
  }
}
