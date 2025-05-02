import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schemas/users.schema';  
import { UsersController } from './users.controller';

@Module({
    imports:[MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])],
    providers: [UsersService],
    controllers: [UsersController]
})
export class UsersModule {}