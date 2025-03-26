import { Controller, All } from '@nestjs/common';
import { AuthService } from './auth.service';
import { toNodeHandler } from 'better-auth/node'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @All('*')
  betterAuthHandler() {
    return toNodeHandler(auth)
  }
}


