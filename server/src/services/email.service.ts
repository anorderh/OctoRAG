import { inject, injectable, singleton } from "tsyringe";
import { Transporter } from "nodemailer";
import * as nodemailer from "nodemailer";
import { env } from "../env";
import { LogService } from "./log.service";
import { Email } from "../utils/interfaces/email";

@singleton()
export class EmailService {
    transporter: Transporter;

    constructor(
        @inject(LogService) private logService: LogService
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
        this.logService.info(
            `Email sent to "${input.to}" - Subject: "${input.subject}".\n${new Date().toString()}`
        )
    }
}