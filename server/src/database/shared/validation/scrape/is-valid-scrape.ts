import { Scrape } from 'src/data/collections/scrape.collection';
import { MongoCheck } from 'src/data/utils/types/mongo-check';
import { InvalidEntityError } from 'src/shared/classes/errors';

export const isValidScrape: MongoCheck<Scrape | null> = (scrape) => {
    if (scrape == null) {
        throw new InvalidEntityError({
            body: 'The associated scrape was not able to be located.',
        });
    }
};
