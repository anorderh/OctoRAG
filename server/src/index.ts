import "reflect-metadata";
import cors from 'cors';
import {container} from 'tsyringe';
import express, {Express, Request, Response} from 'express';
import { BlobService } from './services/blob.service';
import { MongoService } from "./services/mongo.service";
import { Controller } from "./utils/interfaces/controller";
import { Service } from "./utils/interfaces/service";
import { env } from "./utils/constants/env";
import { AuthController } from "./controllers/auth.controller";

const app : Express = express();

// Setup middleware.
let middlware = [
  cors({
    origin: 'http://localhost:3000'
  }),
  express.json(),
  express.urlencoded()
]
middlware.forEach(m => {
  app.use(m);
})

// Setup controllers.
let apiPath = '/api';
let controllers: Controller[] = [
  container.resolve(AuthController)
];
controllers.forEach((c: Controller) => {
  app.use(apiPath, c.buildRouter());
})

// Setup services.
let services: Service[] = [
  container.resolve(BlobService),
  container.resolve(MongoService)
];
let servicePromise = Promise.all([
  services.map(s => s.initialize())
])

// Start app once all services successfully connect.
servicePromise
  .then(() => {
    let port = env.server.port;
    app.listen(port, () => {
        console.log(`Server is running on port ${port}.`)
    });
  })
  .catch((error : Error) => {
      console.log(error);
      console.log("Express app could not startup properly - exiting...")
  })