import { CreateCollectionOptions, Db, OptionalId } from 'mongodb';
import { RepoLog } from 'src/database/entities/repo-log/repo-log';
import { CollectionId } from 'src/database/shared/constants/collection-id';
import { CollectionSetup } from 'src/database/shared/types/collection-setup';

export const createRepoLogCollection: CollectionSetup<
    OptionalId<RepoLog>
> = async (db: Db) => {
    return await db.createCollection<OptionalId<RepoLog>>(
        CollectionId.RepoLog,
        {
            validator: {
                $jsonSchema: {
                    bsonType: 'object',
                    title: 'RepoLog Validation',
                    required: ['_id', 'chatId', 'date', 'content'],
                    properties: {
                        _id: {
                            bsonType: 'objectId',
                            description: 'Primary identifier',
                        },
                        chatId: {
                            bsonType: 'objectId',
                            description: 'Associated RepoChat _id',
                        },
                        date: {
                            bsonType: 'date',
                            description: 'Log timestamp',
                        },
                        content: {
                            bsonType: 'string',
                            description: 'Log message content',
                        },
                    },
                },
            },
        } as CreateCollectionOptions,
    );
};
