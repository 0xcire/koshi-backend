import { betterAuth } from 'better-auth';
import { admin, openAPI, username } from 'better-auth/plugins';
import { redis } from '@/redis';
import { FIVE_MIN_AS_SECONDS, ONE_HOUR_AS_SECONDS } from '@/types';
import { configInstance } from '@/common/config';
import { ormSync } from '../db/orm';
import { mikroOrmAdapter } from 'better-auth-mikro-orm';
import { Logger } from '@nestjs/common';
import { transporter } from '@/nodemailer';
import {
  createChangeEmailVerification,
  createDeleteAccountEmail,
  createVerificationEmail,
} from '@/common/email-templates';

// TODO``: revisit once https://github.com/better-auth/better-auth/pull/1548 has been merged in
export const auth = betterAuth({
  appName: 'Koshi',
  baseUrl: configInstance.koshi.apiUrl,
  basePath: '/api/auth',
  secret: configInstance.secret.betterAuth,
  database: mikroOrmAdapter(ormSync),
  logger: new Logger('BetterAuth'),
  secondaryStorage: {
    get: async (key) => {
      const value = await redis.get(key);
      return value ? value : null;
    },
    set: async (key, value, ttl) => {
      if (ttl) await redis.set(key, value, 'EX', ttl);
      else await redis.set(key, value);
    },
    delete: async (key) => {
      await redis.del(key);
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }) => {
      // write some code to send an email
      transporter.sendMail({
        from: configInstance.email.senderAddress,
        to: user.email,
        subject: 'Koshi Email Verification',
        html: createVerificationEmail(user, url, token),
      });
    },
    sendOnSignUp: false, // TODO: revert, just testing for now
    autoSignInAfterVerification: true,
    expiresIn: ONE_HOUR_AS_SECONDS,
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // write something custom around this, this is potentially too blocking. for ex. non verified user can sign in but can't generate routes or interact w/ social posts, etc
    autoSignIn: true,
  },
  user: {
    modelName: 'users',
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async (
        { user, newEmail, url, token },
        request,
      ) => {
        transporter.sendMail({
          from: configInstance.email.senderAddress,
          to: newEmail,
          subject: 'Koshi Chnage Email Verification',
          html: createChangeEmailVerification(user, url, token),
        });
      },
    },
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async ({ user, url, token }, request) => {
        transporter.sendMail({
          from: configInstance.email.senderAddress,
          to: user.email,
          subject: 'Koshi Account Deletion',
          html: createDeleteAccountEmail(user, url, token),
        });
      },
    },
  },
  account: {
    modelName: 'accounts',
  },
  verification: {
    disableCleanup: false, // not sure if this is a default val
    modelName: 'verifications',
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: FIVE_MIN_AS_SECONDS,
    },
  },
  rateLimit: {
    enabled: true,
    storage: 'secondary-storage',
  },
  plugins: [
    username({
      usernameValidator: (username) => username !== 'admin',
    }),
    admin(),
    openAPI(),
  ],
  // mikro-orm adapter
  advanced: {
    generateId: false,
  },
  disabledPaths: [
    '/sign-in/social', //revisit
    '/link-social',
    '/unlink-account',
    '/list-accounts',
  ],
});
