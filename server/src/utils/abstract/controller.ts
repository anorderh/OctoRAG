import { Router } from "express";

export abstract class ControllerBase {
    router: Router = Router();
}