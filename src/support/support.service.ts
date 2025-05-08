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
import { Types } from 'mongoose';
import { error } from 'console';

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
        let limit,offset;
        if (params.user) query.user = params.user;
        if (params.limit) limit = params.limit;
        if (params.offset) offset = params.offset
        if (params.isActive) query.isActive = params.isActive
        
        return await this.requestModel.find(query).limit(limit).skip(offset).exec();
      }

      async sendMessage(data: SendMessageDto): Promise<MessageDocument> {

        let newMessage = await this.messageModel.create({
          author: data.author,
          sentAt: new Date(),
          text: data.text,
        })
        
    
        const updated = await this.requestModel.findByIdAndUpdate(
          data.supportRequest,
          { $push: { messages: newMessage._id } },
          { new: true },
        ).exec();

        if (!updated) throw new Error('Ошибка отправки собщения')
  
        this.emitNewMessage(updated,newMessage)
        
        return newMessage;
      }

      async getMessages(supportRequest: ID): Promise<MessageDocument[]> {
        const sr = await this.requestModel.findById(supportRequest).exec();
        let messages = await this.messageModel.find({_id:sr?.messages})
        return messages;
      }
      
      subscribe(
        handler: (supportRequest: SupportRequestDocument, message: MessageDocument) => void
      ): () => void{
        this.handlers.push(handler);
        return () => {
          this.handlers = this.handlers.filter(h => h !== handler);
        };
      }

      emitNewMessage(supportRequest: SupportRequestDocument, message: MessageDocument) {
    this.handlers.forEach(handler => handler(supportRequest, message));
  }      
}


@Injectable()
export class SupportRequestClientService implements ISupportRequestClientService{
    constructor(@InjectModel(SupportRequest.name) private requestModel:Model<SupportRequestDocument>,
    @InjectModel(Message.name) private messageModel:Model<MessageDocument>,
    private eventEmitter:EventEmitter2){}

    async createSupportRequest(data: CreateSupportRequestDto): Promise<SupportRequestDocument> {
        let newMessage = await this.messageModel.create({
          author: data.user,
          sentAt: new Date(),
          text: data.text,
        })

        let supportRequest = await this.requestModel.create({
            user:data.user,
            createdAt:new Date(),
            messages:[newMessage._id],
            isActive:true
        })

        return supportRequest.save()

    }

    async markMessagesAsRead(params: MarkMessagesAsReadDto): Promise<void> {
      await this.messageModel.updateMany(
        {
          _id: { $in: await this.getRequestMessagesIds(params.supportRequest) },
          author: { $ne: params.user },
          readAt: { $exists: false },
          sentAt: { $lt: params.createdBefore }
        },
        { $set: { readAt: new Date() } }
      ).exec();
      }

      async getUnreadCount(supportRequest: ID): Promise<number> {
        const messageIds = await this.getRequestMessagesIds(supportRequest);
        const request = await this.requestModel
          .findById(supportRequest)
          .lean()
          .exec();
        
        return await this.messageModel.countDocuments({
          _id: { $in: messageIds },
          author: { $ne: request?.user },
          readAt: { $exists: false }
        }).exec();
      }

      private async getRequestMessagesIds(reqId:ID):Promise<Types.ObjectId[]>{
        let request = await this.requestModel.findById(reqId).exec()
        if (!request) throw new Error('Запрос не найден')
        return request.messages
      }
      
      async checkNewMessages(reqId:ID):Promise<boolean>{
        let result = await this.getUnreadCount(reqId)
        if(result> 0) return true;
        else return false;
      }
}


@Injectable()
export class SupportRequestEmployeeService implements ISupportRequestEmployeeService{
  constructor(
    @InjectModel(SupportRequest.name) private requestModel:Model<SupportRequestDocument>,
    @InjectModel(Message.name) private messageModel:Model<MessageDocument>
  ){}

  async markMessagesAsRead(params: MarkMessagesAsReadDto){
    await this.messageModel.updateMany(
      {
        _id: { $in: await this.getRequestMessagesIds(params.supportRequest) },
        author: { $eq: params.user },
        readAt: { $exists: false },
        sentAt: { $lt: params.createdBefore }
      },
      { $set: { readAt: new Date() } }
    ).exec();
  }

  async getUnreadCount(supportRequest: ID): Promise<number> {
    const messageIds = await this.getRequestMessagesIds(supportRequest);
    const request = await this.requestModel
      .findById(supportRequest)
      .lean()
      .exec();
    
    return await this.messageModel.countDocuments({
      _id: { $in: messageIds },
      author: { $eq: request?.user },
      readAt: { $exists: false }
    }).exec();
  }

  async closeRequest(supportRequest: ID): Promise<void> {
    let updatedRequest = await this.requestModel.findByIdAndUpdate(
      supportRequest,
      { isActive: false },
    ).exec();
    if (!updatedRequest) throw new Error('Не удалось закрыть запрос')
    
  }

  private async getRequestMessagesIds(reqId:ID):Promise<Types.ObjectId[]>{
    let request = await this.requestModel.findById(reqId).exec()
    if (!request) throw new Error('Запрос не найден')
    return request.messages
  }
  
  async checkNewMessages(reqId:ID):Promise<boolean>{
    let result = await this.getUnreadCount(reqId)
    if(result> 0) return true;
    else return false;
  }
}