import { CreateCollectionOptions, Db, OptionalId } from 'mongodb';
import { RepoMessage } from 'src/database/entities/repo-message/repo-message';
import { CollectionId } from 'src/database/shared/constants/collection-id';
import { CollectionSetup } from 'src/database/shared/types/collection-setup';

export const createRepoMessageCollection: CollectionSetup<
    OptionalId<RepoMessage>
> = async (db: Db) => {
    return await db.createCollection<OptionalId<RepoMessage>>(
        CollectionId.RepoMessage,
        {
            validator: {
                $jsonSchema: {
                    bsonType: 'object',
                    title: 'RepoMessage Validation',
                    required: ['_id', 'chatId', 'source', 'date'],
                    properties: {
                        _id: {
                            bsonType: 'objectId',
                            description: 'Primary identifier',
                        },
                        chatId: {
                            bsonType: 'objectId',
                            description: 'Associated RepoChat _id',
                        },
                        source: {
                            bsonType: 'string',
                            enum: ['ai', 'user'],
                            description: 'Message source',
                        },
                        content: {
                            bsonType: 'string',
                            description: 'Message content',
                        },
                        loading: {
                            bsonType: 'bool',
                            description: 'Whether message is still loading',
                        },
                        date: {
                            bsonType: 'date',
                            description: 'Message timestamp',
                        },
                    },
                },
            },
        } as CreateCollectionOptions,
    );
};
