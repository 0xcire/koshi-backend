import { Inject, Injectable, Logger, Scope } from '@nestjs/common';
import { betterAuth } from 'better-auth';
import { auth } from './auth';
import { fromNodeHeaders } from 'better-auth/node';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  // public readonly config: BetterAuthOptions;
  public readonly auth: ReturnType<typeof betterAuth>;

  constructor(@Inject(REQUEST) private readonly request: Request) {
    this.auth = auth;
  }

  async getUserSession() {
    return await this.auth.api.getSession({
      headers: fromNodeHeaders(this.request.headers),
    });
  }
}
