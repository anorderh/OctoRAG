import { CreateCollectionOptions, Db, ObjectId } from 'mongodb';
import { ChatType } from '../shared/constants/chat-type';
import { CollectionId } from '../shared/constants/collection-id';
import { CollectionSetup } from '../shared/types/collection-setup';

export interface Chat {
    _id: ObjectId;
    _sessionId: ObjectId;
    type: ChatType;
    content: string;
    created: Date;
}

export const createChatCollection: CollectionSetup<Chat> = async (db: Db) => {
    return await db.createCollection(CollectionId.Chat, {
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                title: 'Chat Validation',
                required: ['_id', '_sessionId', 'type', 'content', 'created'],
                properties: {
                    _id: { bsonType: 'objectId' },
                    _sessionId: { bsonType: 'objectId' },
                    type: { bsonType: 'string', enum: Object.values(ChatType) },
                    content: { bsonType: 'string' },
                    created: { bsonType: 'date' },
                },
            },
        },
    } as CreateCollectionOptions);
};
