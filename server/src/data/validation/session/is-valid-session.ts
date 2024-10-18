import { Library } from "src/data/collections/library.collection"
import { Session } from "src/data/collections/session.collection";
import { MongoCheck } from "src/data/utils/types/mongo-check"
import { InvalidEntityError } from "src/error-handling/errors";

export const isValidSession : MongoCheck<Session | null> = (session) => {
    if (session == null) {
        throw new InvalidEntityError({
            body: "The requested session was not able to be located."
        })
    }
}