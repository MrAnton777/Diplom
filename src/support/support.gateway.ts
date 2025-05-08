import { 
  WebSocketGateway, 
  SubscribeMessage, 
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer
} from '@nestjs/websockets';
import { Socket ,Server} from 'socket.io';
import { SupportRequestService } from './support.service';
import { ID } from 'src/types/types';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { CurrentUser } from 'src/auth/dto/user.decorator';
import { InjectModel } from '@nestjs/mongoose';
import { SupportRequest, SupportRequestDocument } from './schemas/request.schema';
import { Model } from 'mongoose';
import { User ,UserDocument} from 'src/users/schemas/users.schema';
import { WsGuard } from 'src/auth/guard/ws.guard';

@WebSocketGateway({ cors: {
  origin: '*',
}, })
export class SupportGateway{
  @WebSocketServer()
  server:Server;

  constructor(private supportService:SupportRequestService,
    @InjectModel(SupportRequest.name) private supportRequestModel:Model<SupportRequestDocument>,
    @InjectModel(User.name) private userModel:Model<UserDocument>
    ){}

  afterInit(server:Server){
    console.log('Websocket connected')
  }

  @UseGuards(WsGuard) //2.5.7
  @SubscribeMessage('subscribeToChat')
  async subscribeToChat(
    @MessageBody() payload,
    @ConnectedSocket() client:Socket,
  ){
    let request = await this.supportRequestModel.findById(payload.chatId);
    let user = client.handshake.auth;
    
    if (!request) this.server.emit('chat not found');
    if (user.role == 'manager' || (user.role == 'client' && user.userId == request?.user)){
      const subscribe = await this.supportService.subscribe(async (supportRequest, message) => {
        if (supportRequest.id === payload.chatId) {
          let author = await this.userModel.findById(message.author)
          client.emit('message.created', {
            id: message.id,
            createdAt: message.sentAt,
            text: message.text,
            readAt: message.readAt,
            author: {
              id: author?._id,
              name: author?.name,
            },
          });
        }
      });

      subscribe();
    }
  }
}
