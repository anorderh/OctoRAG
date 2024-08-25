import "reflect-metadata";
import dotenv from 'dotenv';
dotenv.config({ path: 'server/test/fixtures.ts' })
import { App } from "../src/App";
import { Server } from "http";
import { MongoService } from "../src/services";
import { container } from "tsyringe";

exports.mochaGlobalSetup = async function () {
    this.app = new App();
    await clearDatabase();
    await this.app.startListening();
}

exports.mochaGlobalTeardown = async function () {
    await clearDatabase();
    await this.app.stopListening();
}

async function clearDatabase() {
    let mongo = container.resolve(MongoService);
    await mongo.reset();
}