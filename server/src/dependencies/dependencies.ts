import { container } from "tsyringe";
import { SetupCohere } from "./injections/cohere";
import { SetupInnertube } from "./injections/innertube";
import { SetupOctokit } from "./injections/octokit";
import { SetupOpenAI } from "./injections/openai";
import { SetupPinecone } from "./injections/pinecone";
import { SetupPino } from "./injections/pino";
import { SetupSelenium } from "./injections/selenium";
import { SetupSnoowrap } from "./injections/snoowrap";
import { DependencyInjectionToken } from "./utils/constants/dependency-injection-token";
import { Logger } from "pino";

// Setting up global dependencies.
await SetupPino();
const logger: Logger = container.resolve(DependencyInjectionToken.Pino);
logger.info("Pino logger setup.")

await SetupCohere();
logger.info("Cohere setup.")

await SetupInnertube();
logger.info("Innertube setup.")

await SetupOctokit();
logger.info("Octokit setup.")

await SetupOpenAI();
logger.info("OpenAI setup.")

await SetupPinecone();
logger.info("Pinecone setup.")

await SetupSelenium();
logger.info("Selenium setup.")

await SetupSnoowrap();
logger.info("Snoowrap setup.")