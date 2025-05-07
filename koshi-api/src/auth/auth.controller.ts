import { All, Controller, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { toNodeHandler } from 'better-auth/node';
import { Request, Response } from 'express';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @All('api/auth/*path')
  async betterAuthHandler(@Req() req: Request, @Res() res: Response) {
    // NOTE: logger instantiated and handled in auth.ts. Likely changes once better-auth nestjs pr is merged
    toNodeHandler(this.authService.auth)(req, res);
  }
}
