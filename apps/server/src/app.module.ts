import { Module } from '@nestjs/common';

import { ChatModule } from './modules/chat/chat.module';
import { RecordsModule } from './modules/records/records.module';

@Module({
  imports: [ChatModule, RecordsModule],
})
export class AppModule {}
