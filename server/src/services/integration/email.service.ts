import { inject, injectable, singleton } from "tsyringe";
import { Transporter } from "nodemailer";
import * as nodemailer from "nodemailer";
import { DependencyInjectionToken } from "src/dependencies/utils/constants/dependency-injection-token";
import { Service } from "../utils/abstract/service.abstract";
import { env } from "src/shared/utils/constants/env";
import { Email } from "./utils/interfaces/email";
import { App } from "src/App";

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
                pass: env.email.auth.pass
            }
        });
    }

    async sendMail(input: Email) {
        const info = this.transporter.sendMail(input);
        App.logger.info(
            `Email sent to "${input.to}" - Subject: "${input.subject}".\n${new Date().toString()}`
        )
    }
}