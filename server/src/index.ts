import "reflect-metadata";
import App from "./App";
import { env } from "./env";

let app = new App();

app.dependencies
  .then(() => {
    let port = env.server.port;
    app.express.listen(port, () => {
        console.log(`Server is running on port ${port}.`)
    });
  })
  .catch((error) => {
    console.log(error);
    console.log("Express app could not startup properly - exiting...")
  })