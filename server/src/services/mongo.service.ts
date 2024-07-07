import mongoose from "mongoose";
import { Service } from "../utils/interfaces/service";
import { env } from "../utils/constants/env";
import { injectable } from "tsyringe";

@injectable()
export class MongoService extends Service {
    initialize() {
        return mongoose.connect(env.mongo.connStr).then(() => {
            console.log("Mongoose successfully setup.")
        });
    }
}