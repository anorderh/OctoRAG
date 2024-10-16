import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { inject, injectable, Lifecycle, scoped } from "tsyringe";
import { MongoService } from './mongo.service.js';
import { Collection, ObjectId } from 'mongodb';
import { Service } from '../utils/abstract/service.abstract.js';
import { BoardEventLog, EventLog, UserEventLog } from 'src/data/collections/event.collection.js';
import { DependencyInjectionToken } from 'src/dependencies/utils/constants/dependency-injection-token.js';
import { CollectionId } from 'src/data/utils/constants/collection-id.js';
import { EventType } from 'src/data/utils/constants/event-type.js';
import { EventInput } from '../integration/utils/interfaces/event-input.js';


@injectable()
export class EventService extends Service {
    eventCollection: Collection<EventLog>;
    constructor(
        @inject(MongoService) private mongo: MongoService,
    ) {
        super();
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
    }
}