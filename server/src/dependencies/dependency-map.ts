import { SetupCohere } from "./injections/cohere";
import { SetupInnertube } from "./injections/innertube";
import { SetupOctokit } from "./injections/octokit";
import { SetupOpenAI } from "./injections/openai";
import { SetupPinecone } from "./injections/pinecone";
import { SetupPino } from "./injections/pino";
import { SetupSelenium } from "./injections/selenium";
import { SetupSnoowrap } from "./injections/snoowrap";
import { DependencyInjectionToken } from "./utils/constants/dependency-injection-token";

export const dependencyMap: {[token: string]: Function} = {
    [DependencyInjectionToken.Innertube]: SetupInnertube,
    [DependencyInjectionToken.Octokit]: SetupOctokit,
    [DependencyInjectionToken.OpenAI]: SetupOpenAI,
    [DependencyInjectionToken.Pinecone]: SetupPinecone,
    [DependencyInjectionToken.Pino]: SetupPino,
    [DependencyInjectionToken.SeleniumWebDriver]: SetupSelenium,
    [DependencyInjectionToken.Snoowrap]: SetupSnoowrap,
    [DependencyInjectionToken.Cohere]: SetupCohere
}