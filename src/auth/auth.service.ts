import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument,User,UserSchema } from 'src/users/schemas/users.schema';
import { UsersService } from 'src/users/users.service';
import { signUpDto,signInDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        @InjectModel(User.name) private userModel:Model<UserDocument>,
        private userService:UsersService
    ){}

    async signUp(data:signUpDto): Promise<any>{
        let {email,password,name,contactPhone,role} = data

        let newUser = await this.userService.create(data)

        let token = this.jwtService.sign({userId:newUser._id,email,name,role})

        return token

    }

    async signIn(data:signInDto):Promise<any>{
        let user = await this.userModel.findOne({email:data.email}).exec()

        if(!user) throw new Error('Пользователь не найден! Зарегистрируйтесь')

        let matching = await bcrypt.compare(data.password,user.passwordHash)

        if (!matching) throw new Error('Пароль неверный')

        let token = this.jwtService.sign({userId:user._id,email:user.email,name:user.name,role:user.role})

        return token
    }

      async validateUser(payload: any): Promise<any> {
        
        return { userId: payload.id, email: payload.email,name:payload.name, contactPhone:payload.contactPhone ,role: payload.role };
      }

}
