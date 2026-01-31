import { Logger } from 'pino';
import { container } from 'tsyringe';
import { SetupCohere } from './cohere';
import { SetupInnertube } from './innertube';
import { SetupOctokit } from './octokit';
import { SetupOpenAI } from './openai';
import { SetupPinecone } from './pinecone';
import { SetupPino } from './pino';
import { SetupSelenium } from './selenium';
import { DependencyInjectionToken } from './shared/constants/dependency-injection-token';
import { SetupSnoowrap } from './snoowrap';

// Setting up global dependencies.
await SetupPino();
const logger: Logger = container.resolve(DependencyInjectionToken.Pino);
logger.info('Pino logger setup.');

await SetupCohere();
logger.info('Cohere setup.');

await SetupInnertube();
logger.info('Innertube setup.');

await SetupOctokit();
logger.info('Octokit setup.');

await SetupOpenAI();
logger.info('OpenAI setup.');

await SetupPinecone();
logger.info('Pinecone setup.');

await SetupSelenium();
logger.info('Selenium setup.');

await SetupSnoowrap();
logger.info('Snoowrap setup.');
