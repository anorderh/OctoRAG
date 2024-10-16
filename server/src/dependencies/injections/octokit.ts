import { Octokit } from "@octokit/rest";
import { container } from "tsyringe";
import { DependencyInjectionToken } from "../utils/constants/dependency-injection-token";
import { env } from "src/shared/utils/constants/env";

export function SetupOctokit() {
    container.registerInstance<Octokit>(
        DependencyInjectionToken.Octokit,
        new Octokit()
    )
}