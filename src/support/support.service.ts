import { Injectable,} from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { SupportRequest, SupportRequestDocument } from './schemas/request.schema';
import { Message , MessageDocument} from './schemas/message.schema';
import { GetChatListParams ,SendMessageDto} from './interfaces/interfaces';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ID } from 'src/types/types';
import { ISupportRequestService,ISupportRequestClientService,ISupportRequestEmployeeService } from './interfaces/interfaces';
import { CreateSupportRequestDto } from './interfaces/interfaces';
import {MarkMessagesAsReadDto} from './interfaces/interfaces';

@Injectable()
export class SupportRequestService implements ISupportRequestService{
    private handlers: ((supportRequest: SupportRequest, message: Message) => void)[] = [];

    constructor(
        @InjectModel(SupportRequest.name) private requestModel:Model<SupportRequestDocument>,
        @InjectModel(Message.name) private messageModel:Model<MessageDocument>,
        private eventEmitter:EventEmitter2
    ){}

    onModuleInit() {
        this.eventEmitter.on('new message', (supportRequest, message) => {
          this.handlers.forEach(handler => handler(supportRequest, message));
        });
      }

    async findSupportRequests(params: GetChatListParams): Promise<SupportRequestDocument[]> {
        const query: any = {};
        if (params.user) query.user = params.user;
        query.isActive = params.isActive
        
        return await this.requestModel.find(query).exec();
      }

      async sendMessage(data: SendMessageDto): Promise<MessageDocument> {
        const message = {
          author: data.author,
          sentAt: new Date(),
          text: data.text,
        };

        let newMessage = await this.messageModel.create(message)
        await newMessage.save()
    
        const updated = await this.requestModel.findByIdAndUpdate(
          data.supportRequest,
          { $push: { messages: newMessage } },
          { new: true },
        ).exec();

        if (!updated) throw new Error('Ошибка отправки собщения')
  
         this.eventEmitter.emit('message.created', updated, newMessage);
        
        return newMessage;
      }

      async getMessages(supportRequest: ID): Promise<Message[]> {
        const sr = await this.requestModel.findById(supportRequest).exec();
        return sr?.messages || [];
      }
      
      subscribe(
        handler: (supportRequest: SupportRequestDocument, message: MessageDocument|Message) => void
      ): () => void{
        this.handlers.push(handler);
        return () => {
          this.handlers = this.handlers.filter(h => h !== handler);
        };
      }
      
}


@Injectable()
export class SupportRequestClientService implements ISupportRequestClientService{
    constructor(@InjectModel(SupportRequest.name) private requestModel:Model<SupportRequestDocument>,
    @InjectModel(Message.name) private messageModel:Model<MessageDocument>,
    private eventEmitter:EventEmitter2){}

    async createSupportRequest(data: CreateSupportRequestDto): Promise<SupportRequestDocument> {
        let message = {
            author:data.user,
            text:data.text,
            sentAt:new Date()
        } 

        let newMessage = await this.messageModel.create(message)
        newMessage.save()

        let supportRequest = await this.requestModel.create({
            user:data.user,
            createdAt:new Date(),
            messages:[newMessage],
            isActive:true
        })

        return supportRequest.save()

    }

    async markMessagesAsRead(params: MarkMessagesAsReadDto): Promise<void> {
        await this.requestModel.updateOne(
          { 
            _id: params.supportRequest,
            'messages.author': { $ne: params.user },
            'messages.readAt': { $exists: false },
            'messages.sentAt': { $lt: params.createdBefore },
          },
          { 
            $set: { 'messages.$[elem].readAt': new Date() } 
          },
          { 
            arrayFilters: [{ 'elem.readAt': { $exists: false } }],
          }
        ).exec();
      }

      async getUnreadCount(supportRequest: ID): Promise<number> {
        const sr = await this.requestModel.findById(supportRequest).exec();
        if (!sr) throw new Error('Невозможно полусить непрочитанные сообщения')
        return sr.messages.filter(
          m => !m.readAt && m.author.toString() !== sr.user.toString()
        ).length;
      }
}