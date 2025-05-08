import { CanActivate,Injectable } from "@nestjs/common";
import { UsersService } from "src/users/users.service";
import { AuthService } from "../auth.service";
import { ExecutionContext } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User, UserDocument } from "src/users/schemas/users.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { WsException } from "@nestjs/websockets";

@Injectable()
export class WsGuard implements CanActivate {
  constructor(
    @InjectModel(User.name) private userModel:Model<UserDocument>,
    private jwtService:JwtService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {    
    const token = context
      .switchToWs()
      .getClient()
      .handshake.headers.authorization.split(' ')[1]; 

    try {
      const payload = await this.jwtService.verify(String(token))
      
      return new Promise((resolve, reject) => {
        return this.userModel.findById(payload._id).then((user) => {
          if (user) {
            context.switchToWs().getData().user = user; 
            resolve(Boolean(user));
          } else {
            reject(false);
          }
        });
      });
    } catch (e) {
      throw new WsException(e.message);
    }
  }
}
