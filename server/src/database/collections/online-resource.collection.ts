import { CreateCollectionOptions, Db, ObjectId } from 'mongodb';
import { CollectionId } from '../shared/constants/collection-id';
import { OnlineResourceType } from '../shared/constants/online-resource-type';
import { CollectionSetup } from '../shared/types/collection-setup';

export interface OnlineResource {
    _id: ObjectId;
    url: string;
    type: OnlineResourceType;
    _libraryId: ObjectId;
    created: Date;
}

export const createOnlineResourceCollection: CollectionSetup<
    OnlineResource
> = async (db: Db) => {
    return await db.createCollection(CollectionId.OnlineResource, {
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                title: 'Online Resource Validation',
                required: ['_id', 'url', 'type', '_libraryId', 'created'],
                properties: {
                    _id: { bsonType: 'objectId' },
                    url: { bsonType: 'string' },
                    type: {
                        bsonType: 'string',
                        enum: Object.values(OnlineResourceType),
                    },
                    _libraryId: { bsonType: 'objectId' },
                    created: { bsonType: 'date' },
                },
            },
        },
    } as CreateCollectionOptions);
};
