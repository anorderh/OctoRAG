import { Logger } from 'pino';
import { container } from 'tsyringe';
import { SetupCohere } from './cohere';
import { SetupOctokit } from './octokit';
import { SetupOpenAI } from './openai';
import { SetupPinecone } from './pinecone';
import { SetupPino } from './pino';
import { DependencyInjectionToken } from './shared/constants/dependency-injection-token';

await SetupPino();
const logger: Logger = container.resolve(DependencyInjectionToken.Pino);
logger.info('Pino logger setup.');

await SetupCohere();
logger.info('Cohere setup.');

await SetupOctokit();
logger.info('Octokit setup.');

await SetupOpenAI();
logger.info('OpenAI setup.');

await SetupPinecone();
logger.info('Pinecone setup.');
