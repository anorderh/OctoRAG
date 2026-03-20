import { Octokit } from '@octokit/rest';
import { inject, injectable } from 'tsyringe';

import { MongoService } from './mongo.service.js';
import { Service } from './shared/abstract/service.abstract.js';

import { ObjectId } from 'mongodb';
import { InvalidURLFormatError } from '../shared/classes/errors.js';

@injectable()
export class OctokitService extends Service {
    private octokit: Octokit;

    private readonly maxGithubRepoSizeKb = 500_000; // adjust as needed

    constructor(@inject(MongoService) private mongo: MongoService) {
        super();

        this.octokit = new Octokit({
            auth: process.env.GITHUB_TOKEN,
        });
    }

    public async getRepoDetailsFromUrl(url: URL, chatId: ObjectId) {
        const pathname = url.pathname;
        await this.mongo.submitLog(`Parsing pathname "${pathname}"...`, chatId);
        const parts = pathname.split('/').filter(Boolean);
        if (!url.href.includes('github.com') || parts.length !== 2) {
            await this.mongo.submitLog(`Pathname failed to be parsed.`, chatId);
            throw new InvalidURLFormatError();
        }
        const [owner, repo] = parts;
        await this.mongo.submitLog(`Pathname successfully parsed.`, chatId);
        await this.mongo.submitLog(
            `Reviewing Github repository details...`,
            chatId,
        );
        const { data: info } = await this.octokit.repos.get({
            owner,
            repo,
        });
        await this.mongo.submitLog(
            `Repo details:
Name: ${info.name}
Owner: ${info.owner.login}
Size: ${info.size}
Stars: ${info.stargazers_count}
Default Branch: ${info.default_branch}`,
            chatId,
        );
        return info;
    }
}
