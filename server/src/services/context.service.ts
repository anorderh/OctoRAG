import { injectable, singleton } from "tsyringe";
import pino, { Logger } from "pino";
import { Token } from "../utils/interfaces/token";
import { env } from "../env";

@injectable()
export class ContextService {}