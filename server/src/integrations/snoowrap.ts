import Snoowrap from 'snoowrap';
import { env } from 'src/shared/constants/env';
import { container } from 'tsyringe';
import { DependencyInjectionToken } from './shared/constants/dependency-injection-token';
import { instantiate } from './shared/extensions/instantiate';

export const SetupSnoowrap = instantiate(
    DependencyInjectionToken.Snoowrap,
    async function () {
        container.registerInstance<Snoowrap>(
            DependencyInjectionToken.Snoowrap,
            new Snoowrap({
                clientId: env.reddit.clientId,
                clientSecret: env.reddit.clientSecret,
                userAgent: env.reddit.userAgent,
                username: env.reddit.username,
                password: env.reddit.password,
            }),
        );
    },
);
