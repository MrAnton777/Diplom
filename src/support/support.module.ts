import { Module } from '@nestjs/common';
import { SupportRequestService } from './support.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema} from './schemas/message.schema';
import { SupportRequest,SupportRequestSchema } from './schemas/request.schema';
import { SupportRequestClientService, SupportRequestEmployeeService } from './support.service';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports:[EventEmitterModule.forRoot(),MongooseModule.forFeature([ { name: SupportRequest.name, schema: SupportRequestSchema },
    { name: Message.name, schema: MessageSchema },])],
  providers: [SupportRequestService,SupportRequestClientService,SupportRequestEmployeeService]
})
export class SupportModule {}
