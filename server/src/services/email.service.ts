import { inject, injectable, singleton } from "tsyringe";
import { Transporter } from "nodemailer";
import * as nodemailer from "nodemailer";
import { env } from '../env.js';
import { Email } from '../utils/interfaces/email.js';
import { InstanceDeps } from '../utils/enums/instance-deps.js';
import { Logger } from "pino";

@singleton()
export class EmailService {
    transporter: Transporter;

    constructor(
        @inject(InstanceDeps.Logger) private logger: Logger
    ) {
        this.transporter = nodemailer.createTransport({
            host: env.email.host,
            port: env.email.port,
            secure: env.email.secure,
            auth: {
                user: env.email.auth.user,
                pass: env.email.auth.pass
            }
        });
    }

    async sendMail(input: Email) {
        const info = this.transporter.sendMail(input);
        this.logger.info(
            `Email sent to "${input.to}" - Subject: "${input.subject}".\n${new Date().toString()}`
        )
    }
}