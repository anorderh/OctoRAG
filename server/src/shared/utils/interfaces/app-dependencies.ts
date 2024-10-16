import { Octokit } from "@octokit/rest";
import { WebDriver } from "selenium-webdriver";
import Innertube from "youtubei.js";
import OpenAI from 'openai';
import { Pinecone } from "@pinecone-database/pinecone";
import { Logger } from "pino";
import Snoowrap from "snoowrap";

export interface AppDependencies {
    innertube: Innertube,
    octokit: Octokit,
    openai: OpenAI,
    pinecone: Pinecone,
    pino: Logger,
    selenium: WebDriver,
    snoowrap: Snoowrap
}