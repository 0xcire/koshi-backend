import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { LoggerModule } from 'nestjs-pino';
import { NodeEnvironment } from './types';
import { NoAuthBodyParser } from './common/middleware/no-auth-body-parser.middleware';
import { UsersModule } from './users/users.module';
import { config } from './common/config';
import mikroConfig from './db/mikro-orm.config';
import { MailerModule } from '@nestjs-modules/mailer';
import { IConfig } from './common/config/types';
import { NrelModule } from './nrel/nrel.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [config],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== NodeEnvironment.Prod
            ? { target: 'pino-pretty' }
            : undefined,
      },
    }),
    MailerModule.forRootAsync({
      useFactory: (configService: ConfigService<IConfig>) => {
        return {
          transport: {
            host: configService.get('smtp.host', { infer: true }),
            port: configService.get('smtp.port', { infer: true }),
            secure: configService.get('smtp.secure', { infer: true }),
            auth: {
              user: configService.get('smtp.auth.user', { infer: true }),
              pass: configService.get('smtp.auth.pass', { infer: true }),
            },
          },
          defaults: {
            from: configService.get('email.senderAddress', { infer: true }),
          },
        };
      },
      inject: [ConfigService],
    }),
    MikroOrmModule.forRoot(mikroConfig),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    NrelModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(NoAuthBodyParser).forRoutes('*');
  }
}
