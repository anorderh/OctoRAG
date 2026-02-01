import { Scrape } from 'src/database/collections/scrape.collection';
import { InvalidEntityError } from 'src/shared/classes/errors';
import { MongoCheck } from '../../types/mongo-check';

export const isValidScrape: MongoCheck<Scrape | null> = (scrape) => {
    if (scrape == null) {
        throw new InvalidEntityError({
            body: 'The associated scrape was not able to be located.',
        });
    }
};
