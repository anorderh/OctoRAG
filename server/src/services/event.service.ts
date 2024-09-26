import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { inject, injectable, Lifecycle, scoped } from "tsyringe";
import { env } from '../env.js';
import { MongoService } from './mongo.service.js';
import { CollectionId } from '../utils/enums/collection-id.js';
import { BoardEventLog, EventLog, User, UserEventLog } from '../data/collections/index.js';
import { Collection, ObjectId } from 'mongodb';
import { InstanceDeps } from '../utils/enums/instance-deps.js';
import { Logger } from 'pino';
import { EventInput } from '../utils/interfaces/event-input.js';
import { EventType } from '../utils/enums/event-type.js';


@injectable()
export class EventService {
    eventCollection: Collection<EventLog>;
    constructor(
        @inject(MongoService) private mongo: MongoService,
        @inject(InstanceDeps.Logger) private logger: Logger
    ) {
        this.eventCollection = this.mongo.db.collection<EventLog>(CollectionId.EventLog);
    }

    public async postEvent(type: EventType, input: EventInput) {
        switch (type) {
            case (EventType.Board): {
                await this.eventCollection.insertOne({
                    _id: new ObjectId(),
                    type: EventType.Board,
                    event: input.event,
                    occurred: new Date(),
                    ref: input.ref,
                    boardId: input.boardId
                } as BoardEventLog);
                break;
            }
            case (EventType.User): {
                await this.eventCollection.insertOne({
                    _id: new ObjectId(),
                    type: EventType.User,
                    event: input.event,
                    occurred: new Date(),
                    ref: input.ref,
                    userId: input.userId
                } as UserEventLog);
                break;
            }
        }
        this.logger.info(`Event occurred! - $ON.stringify(input)}`);
    }
}