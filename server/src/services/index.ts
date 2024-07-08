import { InjectionToken } from "tsyringe";
import { Service } from "../utils/interfaces/service.interface";
import { BlobService } from "./blob.service";
import { MongoService } from "./mongo.service";

export const services: (typeof Service)[] = [
    BlobService,
    MongoService
];