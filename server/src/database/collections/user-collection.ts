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
                required: ['username', 'email', 'password'],
                properties: {
                    _id: {
                        bsonType: 'objectId',
                        description: 'Primary identifier',
                    },
                    username: {
                        bsonType: 'string',
                        minLength: 1,
                        description: 'User display name',
                    },
                    email: {
                        bsonType: 'string',
                        pattern: '^.+@.+\\..+$',
                        description: 'User email address',
                    },
                    password: {
                        bsonType: 'string',
                        description: 'Hashed user password',
                    },
                },
            },
        },
    } as CreateCollectionOptions);
};
