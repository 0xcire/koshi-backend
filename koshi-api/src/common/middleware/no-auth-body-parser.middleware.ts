import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import * as express from 'express';
import type { Request, Response, NextFunction } from 'express';

@Injectable()
export class NoAuthBodyParser implements NestMiddleware {
  private readonly logger = new Logger(NoAuthBodyParser.name);
  constructor() {}

  use(req: Request, res: Response, next: NextFunction) {
    const IS_BETTER_AUTH_API_ROUTE = req.baseUrl.startsWith('/api/auth');
    if (IS_BETTER_AUTH_API_ROUTE) {
      this.logger.debug(
        'Deferring body parsing to better-auth for:',
        req.baseUrl,
      );
      next();
      return;
    }

    express.json()(req, res, (err) => {
      if (err) {
        next(err); // Pass any errors to the error-handling middleware
        return;
      }
      this.logger.debug('Handling body parsing for:', req.baseUrl);
      express.urlencoded({ extended: true })(req, res, next);
    });
  }
}
