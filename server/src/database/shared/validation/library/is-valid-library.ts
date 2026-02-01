import { Library } from 'src/database/collections/library.collection';
import { InvalidLibraryError } from 'src/shared/classes/errors';
import { MongoCheck } from '../../types/mongo-check';

export const isValidLibrary: MongoCheck<Library | null> = (library) => {
    if (library == null) {
        throw new InvalidLibraryError();
    }
};
