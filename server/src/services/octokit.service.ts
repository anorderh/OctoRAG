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
        const parts = pathname.split('/').filter(Boolean);
        if (!url.href.includes('github.com') || parts.length !== 2) {
            throw new InvalidURLFormatError();
        }
        const [owner, repo] = parts;
        const { data: info } = await this.octokit.repos.get({
            owner,
            repo,
        });
        return info;
    }
}
