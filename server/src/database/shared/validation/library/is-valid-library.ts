import { Library } from 'src/data/collections/library.collection';
import { MongoCheck } from 'src/data/utils/types/mongo-check';
import { InvalidLibraryError } from 'src/shared/classes/errors';

export const isValidLibrary: MongoCheck<Library | null> = (library) => {
    if (library == null) {
        throw new InvalidLibraryError();
    }
};
