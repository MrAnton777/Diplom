import { Module } from '@nestjs/common';
import { SupportRequestService } from './support.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema} from './schemas/message.schema';
import { SupportRequest,SupportRequestSchema } from './schemas/request.schema';
import { SupportRequestClientService, SupportRequestEmployeeService } from './support.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SupportController } from './support.controller';
import { User, UserSchema } from 'src/users/schemas/users.schema';
import { SupportGateway } from './support.gateway';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
  imports:[EventEmitterModule.forRoot(),JwtModule,MongooseModule.forFeature([ { name: SupportRequest.name, schema: SupportRequestSchema },
    { name: Message.name, schema: MessageSchema },{name:User.name,schema:UserSchema}])],
  providers: [SupportRequestService,SupportRequestClientService,SupportRequestEmployeeService, SupportGateway,JwtService],
  controllers: [SupportController]
})
export class SupportModule {}
