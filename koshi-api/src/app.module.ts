import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { NoAuthBodyParser } from './common/middleware/no-auth-body-parser.middleware';

@Module({
  imports: [AuthModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(NoAuthBodyParser)
      .forRoutes({
        path: 'api/auth/*',
        method: RequestMethod.ALL
      })
  }
}
