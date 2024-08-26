import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { inject, injectable, Lifecycle, scoped } from "tsyringe";
import { env } from '../env';
import { Token } from '../utils/interfaces/token';
import { TokenType } from '../utils/enums/token-type';
import { httpContext } from '../routing/middleware/http-context';
import { MongoService } from './mongo.service';
import { CollectionId } from '../utils/enums/collection-id';
import { BoardEventLog, EventLog, User, UserEventLog } from '../data/collections';
import { InvalidUserError } from '../error-handling/errors';
import { Collection, ObjectId } from 'mongodb';
import { InstanceDeps } from '../utils/enums/instance-deps';
import { Logger } from 'pino';
import { EventInput } from '../utils/interfaces/event-input';
import { includeIf } from '../utils/extensions/include-if';
import { EventType } from '../utils/enums/event-type';


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
        this.logger.info(`Event occurred! - ${JSON.stringify(input)}`);
    }
}