import { httpContext } from 'src/controllers/middleware/http-context';
import { Library } from 'src/database/collections/library.collection';
import { InvalidLibraryAuthError } from 'src/shared/classes/errors';
import { MongoCheck } from '../../types/mongo-check';

export const hasLibraryAuth: MongoCheck<Library | null> = (library) => {
    let userId = httpContext().userId;
    if (userId == null || library == null || !library._userId.equals(userId)) {
        throw new InvalidLibraryAuthError();
    }
};
