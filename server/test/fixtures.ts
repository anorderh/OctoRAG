import "reflect-metadata";
import App from "../src/App";
import { Server } from "http";

exports.mochaGlobalSetup = async function () {
    this.app = new App();
    await this.app.startListening();
}

exports.mochaGlobalTeardown = async function () {
    await this.app.stopListening();
}