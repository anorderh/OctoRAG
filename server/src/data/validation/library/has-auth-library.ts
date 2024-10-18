

import { httpContext } from "src/routing/middleware/http-context";
import { MongoCheck } from "src/data/utils/types/mongo-check";
import { Library } from "src/data/collections/library.collection";
import { InvalidLibraryAuthError } from "src/error-handling/errors";

export const hasLibraryAuth : MongoCheck<Library | null> = (library) => {
    let userId = httpContext().userId;
    if (userId == null || library == null || !library._userId.equals(userId)) {
        throw new InvalidLibraryAuthError();
    }
}