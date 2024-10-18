import { Octokit } from "@octokit/rest";
import { container } from "tsyringe";
import { DependencyInjectionToken } from "../utils/constants/dependency-injection-token";
import { env } from "src/shared/utils/constants/env";
import { instantiate } from "../utils/extensions/instantiate";

export const SetupOctokit = instantiate(
    DependencyInjectionToken.Octokit,
    async function () {
        container.registerInstance<Octokit>(
            DependencyInjectionToken.Octokit,
            new Octokit()
        )
    }
)