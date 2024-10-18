import { container } from 'tsyringe';
import OpenAI from 'openai';
import { DependencyInjectionToken } from "../utils/constants/dependency-injection-token";
import { env } from "src/shared/utils/constants/env";
import Innertube from "youtubei.js";
import { instantiate } from '../utils/extensions/instantiate';

export const SetupInnertube = instantiate(
    DependencyInjectionToken.Innertube,
    async function() {
        container.registerInstance<Innertube>(
            DependencyInjectionToken.Innertube,
            await Innertube.create()
        )
    }
)