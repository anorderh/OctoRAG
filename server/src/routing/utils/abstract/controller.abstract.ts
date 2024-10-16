import { Router } from "express";
import { Logger } from "pino";
import { DependencyInjectionToken } from "src/dependencies/utils/constants/dependency-injection-token";
import { container } from "tsyringe";

export abstract class ControllerBase {
    router: Router = Router();

    constructor() {}
}