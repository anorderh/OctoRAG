import { container } from 'tsyringe';
import Innertube from 'youtubei.js';
import { DependencyInjectionToken } from './shared/constants/dependency-injection-token';
import { instantiate } from './shared/extensions/instantiate';

export const SetupInnertube = instantiate(
    DependencyInjectionToken.Innertube,
    async function () {
        container.registerInstance<Innertube>(
            DependencyInjectionToken.Innertube,
            await Innertube.create(),
        );
    },
);
