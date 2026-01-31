import { Octokit } from '@octokit/rest';
import { container } from 'tsyringe';
import { DependencyInjectionToken } from './shared/constants/dependency-injection-token';
import { instantiate } from './shared/extensions/instantiate';

export const SetupOctokit = instantiate(
    DependencyInjectionToken.Octokit,
    async function () {
        container.registerInstance<Octokit>(
            DependencyInjectionToken.Octokit,
            new Octokit(),
        );
    },
);
