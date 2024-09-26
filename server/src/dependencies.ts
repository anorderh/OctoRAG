import { container } from "tsyringe";
import { InstanceDeps } from './utils/enums/instance-deps.js';
import { pino, Logger, multistream } from "pino";
import * as fs from 'fs';
import { env } from './env.js';
import path from "path";
import OpenAI from 'openai';
import { Pinecone } from "@pinecone-database/pinecone";
import { Innertube } from "youtubei.js";
import { Octokit } from "@octokit/rest";
import Snoowrap from "snoowrap";
import { TokScript } from "./utils/extensions/tokscript.js";
import { Browser, Builder, WebDriver } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome.js";

export const instancedDependencies : {[id: string]: () => Promise<void>} = {
    [InstanceDeps.Logger]: async () => {
        // Prepare log output (create dir if it doesn't exist)
        let timestamp = new Date().toISOString().replace(/[:.-]/g, '_');
        let logFilePath = `${env.pathes.logs}/${`log_${timestamp}.log`}`;
        fs.mkdirSync(path.dirname(logFilePath), { recursive: true });

        // Create pino transport for logging to both console & file dest.
        let transport = pino.transport({
            targets: [
                env.logging.toConsole 
                    ? {   
                        target: 'pino-pretty'
                    }
                    : null,
                env.logging.toFile
                    ? {
                        target: 'pino-pretty',
                        options: {
                            destination: `${env.pathes.logs}/${`log_${timestamp}.log`}`
                        }
                    }
                    : null,
            ].filter(t => !!t)
        })

        // Inject instance.
        container.registerInstance<Logger>(
            InstanceDeps.Logger, 
            pino({
                level: 'info',
                timestamp: pino.stdTimeFunctions.isoTime,
            }
        , transport))
    },
    [InstanceDeps.OpenAI]: async () => {
        container.registerInstance<OpenAI>(
            InstanceDeps.OpenAI,
            new OpenAI({
                apiKey: env.openai.apiKey
            })
        )
    },
    [InstanceDeps.Pinecone]: async () => {
        container.registerInstance<Pinecone>(
            InstanceDeps.Pinecone,
            new Pinecone({
                apiKey: env.pinecone.apiKey
            })
        )
    },
    [InstanceDeps.Innertube]: async () => {
        container.registerInstance<Innertube>(
            InstanceDeps.Innertube,
            await Innertube.create()
        )
    },
    [InstanceDeps.Octokit]: async () => {
        container.registerInstance<Octokit>(
            InstanceDeps.Octokit,
            new Octokit()
        )
    },
    [InstanceDeps.Reddit]: async () => {
        container.registerInstance<Snoowrap>(
            InstanceDeps.Reddit,
            new Snoowrap({
                clientId: env.reddit.clientId,
                clientSecret: env.reddit.clientSecret,
                userAgent: env.reddit.userAgent,
                username: env.reddit.username,
                password: env.reddit.password
            })
        )
    },
    [InstanceDeps.WebDriver]: async () => {
        let options = new Options();
        // options.addArguments("--headless=new")
        container.registerInstance<WebDriver>(
            InstanceDeps.WebDriver,
            await new Builder()
                .forBrowser(Browser.CHROME)
                .setChromeOptions(options)
                .build()
        )
    }
}