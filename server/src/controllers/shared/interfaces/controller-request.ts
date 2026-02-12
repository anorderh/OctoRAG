import { Request } from 'express';

export type ControllerRequest<P = unknown, B = unknown, Q = unknown> = Request<
    P,
    {},
    B,
    Q
>;
export type ControllerQueryRequest<Q> = Request<{}, {}, {}, Q>;
export type ControllerParamsRequest<P> = Request<P, {}, {}, {}>;
export type ControllerBodyRequest<B> = Request<{}, {}, B>;
