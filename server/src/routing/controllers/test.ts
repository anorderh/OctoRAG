import { Request, Response } from "express";
import { Authorize, Controller, Get } from "../decorators";
import { singleton } from "tsyringe";
import { ControllerBase } from "../../utils/abstract/controller";


@Controller('/test')
@singleton()
export class TestController extends ControllerBase {

    @Get('/')
    @Authorize()
    public test(req: Request, res: Response) {
        res.status(200).send("Auth successfully passed!");
    }
}