import { CreateCollectionOptions, Db, OptionalId } from 'mongodb';
import { User } from 'src/database/entities/user/user';
import { CollectionId } from 'src/database/shared/constants/collection-id';
import { CollectionSetup } from 'src/database/shared/types/collection-setup';

export const createUserCollection: CollectionSetup<OptionalId<User>> = async (
    db: Db,
) => {
    return await db.createCollection<OptionalId<User>>(CollectionId.User, {
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                title: 'User Validation',
                required: ['_id', 'name'],
                properties: {
                    _id: {
                        bsonType: 'objectId',
                        description: 'Primary identifier',
                    },
                    name: {
                        bsonType: 'string',
                        minLength: 1,
                        description: 'User display name',
                    },
                },
            },
        },
    } as CreateCollectionOptions);
};
