import "reflect-metadata";
import App from "./App";
import { services } from "./services";
import { container } from "tsyringe";
import { env } from "./env";

let app = new App();

Promise.all(
  services.map((s) => {
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