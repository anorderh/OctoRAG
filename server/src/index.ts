import "reflect-metadata";
import { InjectionToken, container, injectable } from "tsyringe";
import { App } from './App';

let app = container.resolve(App);
app.startListening();