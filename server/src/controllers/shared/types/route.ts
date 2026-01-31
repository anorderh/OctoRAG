import {Request, Response} from "express";

export type Route = (req: Request, res: Response) => void;