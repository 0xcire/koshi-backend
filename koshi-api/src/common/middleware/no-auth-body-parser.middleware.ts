import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class NoAuthBodyParser implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    switch (req.url) {
      case '':
        break;
      case '':
        break;
      default:
        break;
    }
  }
}
