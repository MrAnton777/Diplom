import { Controller ,Body,Post, UseGuards, Req} from '@nestjs/common';
import { AuthService } from './auth.service';
import { signInDto, signUpDto } from './dto/auth.dto';
import { CurrentUser } from './dto/user.decorator';
import { User } from 'src/users/schemas/users.schema';
import { Res } from '@nestjs/common';
import { Response ,Request} from 'express';
import { JwtAuthGuard } from './guard/jwt.guard';

@Controller('api')
export class AuthController {
    constructor(private authService:AuthService){}

    @Post('auth/login')//2.3.1
    async login(@Body() data:signInDto, @CurrentUser() user:User,@Res() res:Response){
        if (user) return res.send('Вы уже аутентифицированны')
        
        let {token,userData} = await this.authService.signIn(data)

        res.cookie('jwt', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 86400000,
            domain: 'localhost',
            path: '/api'
          });

        res.json({
            email:userData.email,
            name:userData.name,
            contactPhone:userData.contactPhone
        })
    }

    @UseGuards(JwtAuthGuard)
    @Post('auth/logout')//2.3.2
    async logout(@Res() res:Response,@CurrentUser() user:User){
        console.log(user)
        res.clearCookie('jwt', {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            path:'/api'
          });

        res.json({message:'Вы успешно вышли'})
    }

    @Post('client/register')//2.3.3
    async register(@Body() data:signUpDto,@CurrentUser() user:User,@Res() res:Response){
        if (user) return res.status(403).send('Вы уже аутентифицированны')

        let newUser = await this.authService.signUp(data)
        
        res.json({
            id:newUser._id,
            email:newUser.email,
            name:newUser.name
        })
    }
    

}
