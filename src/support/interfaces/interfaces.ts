import { ID } from "src/types/types";
import { SupportRequestDocument } from "../schemas/request.schema";
import { MessageDocument,Message } from "../schemas/message.schema";

export interface CreateSupportRequestDto {
  user: ID;
  text: string;
}

export interface SendMessageDto {
  author: ID;
  supportRequest: ID;
  text: string;
}
export interface MarkMessagesAsReadDto {
  user: ID;
  supportRequest: ID;
  createdBefore: Date;
}

export interface GetChatListParams {
  user: ID | null;
  isActive: boolean;
}

export interface ISupportRequestService {
    findSupportRequests(params: GetChatListParams): Promise<SupportRequestDocument[]>;
    sendMessage(data: SendMessageDto): Promise<MessageDocument>;
    getMessages(supportRequest: ID): Promise<Message[]>;
    subscribe(
      handler: (supportRequest: SupportRequestDocument, message: MessageDocument) => void
    ): () => void;
  }
  
export interface ISupportRequestClientService {
    createSupportRequest(data: CreateSupportRequestDto): Promise<SupportRequestDocument>;
    markMessagesAsRead(params: MarkMessagesAsReadDto);
    getUnreadCount(supportRequest: ID): Promise<number>;
  }
  
export interface ISupportRequestEmployeeService {
    markMessagesAsRead(params: MarkMessagesAsReadDto);
    getUnreadCount(supportRequest: ID): Promise<number>;
    closeRequest(supportRequest: ID): Promise<void>;
  }