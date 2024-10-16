import "reflect-metadata";
import dotenv from 'dotenv';
dotenv.config({ path: 'server/test/fixtures.ts' })
import { App } from "../src/App.js";
import { Server } from "http";
import { MongoService } from "src/services/data/mongo.service.js";
import { container } from "tsyringe";

exports.mochaGlobalSetup = async function () {
    this.app = new App();
    await clearDatabase();
    await this.app.start();
}

exports.mochaGlobalTeardown = async function () {
    // await clearDatabase();
    await this.app.stop();
}

async function clearDatabase() {
    let mongo = container.resolve(MongoService);
    await mongo.reset();
}