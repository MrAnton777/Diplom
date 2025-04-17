import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from 'src/users/users.module';
import * as dotenv from 'dotenv';
import { JwtAuthGuard } from './guard/jwt.guard';
import { JwtStrategy } from './strategy/jwt.strategy';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { User,UserSchema } from 'src/users/schemas/users.schema';
import { UsersService } from 'src/users/users.service';
import { AuthController } from './auth.controller';

dotenv.config()

@Module({imports:[
  UsersModule,
  PassportModule,
  JwtModule.register({
    secret:process.env.SECRET,
    signOptions: { expiresIn: '5h' }
  }),MongooseModule.forFeature([{name:User.name,schema:UserSchema}])
],
  providers: [AuthService,JwtStrategy,UsersService],
  exports: [JwtStrategy, PassportModule],
  controllers: [AuthController],
})
export class AuthModule {}
