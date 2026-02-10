import { CreateCollectionOptions, Db, OptionalId } from 'mongodb';
import { RepoChat } from 'src/database/entities/repo-chat/repo-chat';
import { ChatStatus } from 'src/database/shared/constants/chat-status.enum';
import { CollectionId } from 'src/database/shared/constants/collection-id';
import { CollectionSetup } from 'src/database/shared/types/collection-setup';

export const createRepoChatCollection: CollectionSetup<
    OptionalId<RepoChat>
> = async (db: Db) => {
    return await db.createCollection<OptionalId<RepoChat>>(
        CollectionId.RepoChat,
        {
            validator: {
                $jsonSchema: {
                    bsonType: 'object',
                    title: 'RepoChat Validation',
                    required: [
                        '_id',
                        'repoName',
                        'repoUrl',
                        'creationDate',
                        'messageCount',
                        'status',
                    ],
                    properties: {
                        _id: {
                            bsonType: 'objectId',
                            description: 'Primary identifier',
                        },
                        repoName: {
                            bsonType: 'string',
                            description: 'Repository name',
                        },
                        repoUrl: {
                            bsonType: 'string',
                            description: 'Repository URL',
                        },
                        creationDate: {
                            bsonType: 'date',
                            description: 'Chat creation timestamp',
                        },
                        lastMessageDate: {
                            bsonType: 'date',
                            description: 'Timestamp of last message',
                        },
                        messageCount: {
                            bsonType: 'int',
                            minimum: 0,
                            description: 'Total messages in chat',
                        },
                        status: {
                            bsonType: 'string',
                            enum: Object.values(ChatStatus),
                            description: 'Chat status',
                        },
                    },
                },
            },
        } as CreateCollectionOptions,
    );
};
