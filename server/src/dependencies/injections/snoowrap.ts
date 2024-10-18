import { Octokit } from "@octokit/rest";
import { container } from "tsyringe";
import { DependencyInjectionToken } from "../utils/constants/dependency-injection-token";
import { env } from "src/shared/utils/constants/env";
import Snoowrap from "snoowrap";
import { instantiate } from "../utils/extensions/instantiate";

export const SetupSnoowrap = instantiate(
    DependencyInjectionToken.Snoowrap,
    async function() {
        container.registerInstance<Snoowrap>(
            DependencyInjectionToken.Snoowrap,
            new Snoowrap({
                clientId: env.reddit.clientId,
                clientSecret: env.reddit.clientSecret,
                userAgent: env.reddit.userAgent,
                username: env.reddit.username,
                password: env.reddit.password
            })
        )
    }
)