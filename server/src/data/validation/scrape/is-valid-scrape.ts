import { Library } from "src/data/collections/library.collection"
import { Scrape } from "src/data/collections/scrape.collection";
import { Session } from "src/data/collections/session.collection";
import { MongoCheck } from "src/data/utils/types/mongo-check"
import { InvalidEntityError } from "src/error-handling/errors";

export const isValidScrape : MongoCheck<Scrape | null> = (scrape) => {
    if (scrape == null) {
        throw new InvalidEntityError({
            body: "The associated scrape was not able to be located."
        })
    }
}