import { ExceptionFilter, Catch, ArgumentsHost, HttpException, UnauthorizedException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = HttpStatus.OK;

    response
      .status(status)
      .json({
        code: "4003",
        message: "Veuillez vous connecter(session expire)",
        value: []
      });
  }
}

// @Get('/routes/user')
//     @UseGuards(AuthGuard('jwt'), RolesGuard)
//     @UseFilters(new HttpExceptionFilter())
//     @Roles('user', 'admin')
//     @ApiBearerAuth()
//     @HttpCode(HttpStatus.OK)
//     @ApiOkResponse({})
//     public async testAuthRoute(){
//         return {
//             message: 'for user and admin'
//         }
//     }