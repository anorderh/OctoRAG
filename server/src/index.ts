import "reflect-metadata";
import { container} from "tsyringe";
import { App } from './App';

let app = container.resolve(App);
app.start();