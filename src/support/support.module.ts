import { Module } from '@nestjs/common';
import { SupportService } from './support.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema} from './schemas/message.schema';
import { SupportRequest,SupportRequestSchema } from './schemas/request.schema';

@Module({
  imports:[MongooseModule.forFeature([ { name: SupportRequest.name, schema: SupportRequestSchema },
    { name: Message.name, schema: MessageSchema },])],
  providers: [SupportService]
})
export class SupportModule {}
