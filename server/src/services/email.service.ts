import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { App } from 'src/core/App';
import { env } from 'src/shared/constants/env';
import { singleton } from 'tsyringe';
import { Service } from './shared/abstract/service.abstract';
import { Email } from './shared/interfaces/email';

@singleton()
export class EmailService extends Service {
    transporter: Transporter;

    constructor() {
        super();
        this.transporter = nodemailer.createTransport({
            host: env.email.host,
            port: env.email.port,
            secure: env.email.secure,
            auth: {
                user: env.email.auth.user,
                pass: env.email.auth.pass,
            },
        });
    }

    async sendMail(input: Email) {
        const info = this.transporter.sendMail(input);
        App.logger.info(
            `Email sent to "${input.to}" - Subject: "${input.subject}".\n${new Date().toString()}`,
        );
    }
}
