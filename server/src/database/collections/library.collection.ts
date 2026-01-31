import { CreateCollectionOptions, Db, ObjectId } from 'mongodb';
import { CollectionId } from '../shared/constants/collection-id';
import { CollectionSetup } from '../shared/types/collection-setup';

export interface Library {
    _id: ObjectId;
    name: string;
    _userId: ObjectId;
    created: Date;
    pendingScrape: boolean;
    lastScraped: Date;
}

export const createLibraryCollection: CollectionSetup<Library> = async (
    db: Db,
) => {
    return await db.createCollection(CollectionId.Library, {
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                title: 'Library Validation',
                required: ['_id', 'name', 'created'],
                properties: {
                    _id: { bsonType: 'objectId' },
                    name: { bsonType: 'string' },
                    _userId: { bsonType: 'objectId' },
                    created: { bsonType: 'date' },
                    pendingScrape: { bsonType: 'bool' },
                    lastScraped: { bsonType: 'date' },
                },
            },
        },
    } as CreateCollectionOptions);
};
