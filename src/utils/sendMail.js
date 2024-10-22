import nodemailer from 'nodemailer';
import { SMTP } from '../constants/constants.js';
import { env } from './env.js';

const transporter = nodemailer.createTransport({
    host: env(SMTP.SMTP_HOST),
    port: Number(env(SMTP.SMTP_PORT)),
    auth: {
        user: env(SMTP.SMTP_USER),
        pass: env(SMTP.SMTP_PASSWORD),
    },
});

export const sendMail = (options) => transporter.sendMail(options);