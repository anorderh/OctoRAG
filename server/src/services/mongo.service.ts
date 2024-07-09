import mongoose, { Model, model } from "mongoose";
import { AsyncService } from "../utils/interfaces/async-service.interface";
import { env } from "../env";
import { injectable } from "tsyringe";

@injectable()
export class MongoService extends AsyncService {
    initialize() {
        return mongoose.connect(env.mongo.connStr).then(() => {
            console.log("Mongoose successfully setup.")
        });
    }
}