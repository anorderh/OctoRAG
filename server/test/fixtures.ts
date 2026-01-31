import dotenv from 'dotenv';
import 'reflect-metadata';
import { MongoService } from 'src/services/mongo.service.js';
import { container } from 'tsyringe';
import { App } from '../src/App.js';
dotenv.config({ path: 'server/test/fixtures.ts' });

exports.mochaGlobalSetup = async function () {
    this.app = new App();
    await clearDatabase();
    await this.app.start();
};

exports.mochaGlobalTeardown = async function () {
    // await clearDatabase();
    await this.app.stop();
};

async function clearDatabase() {
    let mongo = container.resolve(MongoService);
    await mongo.reset();
}
