import "reflect-metadata";
import { container} from "tsyringe";
import { App } from './App.js';

let app = container.resolve(App);
app.start();