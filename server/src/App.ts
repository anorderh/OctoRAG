import express, { Express, Router } from "express";
import cors from "cors";
import { env } from "./env";
import { routers } from "./routers";

class App {
    instance: Express
    middleware: any[] = [
        cors({
            origin: env.server.origin
        }),
        express.json(),
        express.urlencoded()
    ]
    routers: Router[] = routers;

    constructor() {
        this.instance = express();
        this.middleware.forEach((m) => this.instance.use(m));
        this.routers.forEach((r) => {
            let path = env.server.apiPath;
            this.instance.use(path, r)
        });
    }
}

export default App;