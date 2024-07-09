import "reflect-metadata";
import App from "./App";
import { BlobService, MongoService } from "./services";
import { InjectionToken, container } from "tsyringe";
import { env } from "./env";
import { AsyncService } from "./utils/interfaces/async-service.interface";

let app = new App();

Promise.all(
  ([
    BlobService,
    MongoService
  ] as InjectionToken<AsyncService>[]).map((s) => {
      let instance = container.resolve(s);
      return instance.initialize();
  })
).then(() => {
    // Start listening.
    let port = env.server.port;
    app.instance.listen(port, () => {
        console.log(`Server is running on port ${port}.`)
    });
  })
  .catch((error : Error) => {
    console.log(error);
    console.log("Express app could not startup properly - exiting...")
  })