import { Session } from 'src/database/collections/session.collection';
import { InvalidEntityError } from 'src/shared/classes/errors';
import { MongoCheck } from '../../types/mongo-check';

export const isValidSession: MongoCheck<Session | null> = (session) => {
    if (session == null) {
        throw new InvalidEntityError({
            body: 'The requested session was not able to be located.',
        });
    }
};
