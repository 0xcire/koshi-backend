import { AuthService } from '@/auth/auth.service';
import { CanActivate, Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly authService: AuthService,
  ) {}

  async canActivate(): Promise<boolean> {
    const session = await this.authService.getUserSession();

    if (!session) return false;

    this.request.session = session.session;
    this.request.user = session.user;

    return true;
  }
}
