import { httpContext } from 'src/controllers/middleware/http-context';
import { Library } from 'src/data/collections/library.collection';
import { MongoCheck } from 'src/data/utils/types/mongo-check';
import { InvalidLibraryAuthError } from 'src/shared/classes/errors';

export const hasLibraryAuth: MongoCheck<Library | null> = (library) => {
    let userId = httpContext().userId;
    if (userId == null || library == null || !library._userId.equals(userId)) {
        throw new InvalidLibraryAuthError();
    }
};
