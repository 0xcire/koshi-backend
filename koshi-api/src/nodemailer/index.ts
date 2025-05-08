import { configInstance } from '@/common/config';
import * as nodemailer from 'nodemailer';

// use w/ current impt of better-auth
export const transporter = nodemailer.createTransport({
  secure: configInstance.smtp.secure,
  port: configInstance.smtp.port,
  auth: {
    user: configInstance.smtp.auth.user,
    pass: configInstance.smtp.auth.pass,
  },
});
