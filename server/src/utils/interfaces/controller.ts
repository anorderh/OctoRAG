import { Router } from "express";

export abstract class Controller {
    abstract buildRouter(): Router;
}