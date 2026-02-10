import {
    ChangeStream,
    ChangeStreamInsertDocument,
    ChangeStreamUpdateDocument,
} from 'mongodb';
import { Server, Socket } from 'socket.io';
import { RepoChat } from 'src/database/entities/repo-chat/repo-chat';
import { RepoLog } from 'src/database/entities/repo-log/repo-log';
import { RepoMessage } from 'src/database/entities/repo-message/repo-message';
import { CollectionId } from 'src/database/shared/constants/collection-id';
import { MongoService } from 'src/services/mongo.service';
import { WebSocketEvents } from 'src/shared/constants/web-socket-events';

export class WebSocket {
    private io: Server;
    private mongo: MongoService;

    constructor(io: Server, mongo: MongoService) {
        this.io = io;
        this.mongo = mongo;

        this.setupSocketHandlers();

        this.watchChats();
        this.watchChatMessages();
        this.watchChatLogs();
    }

    private setupSocketHandlers(): void {
        this.io.on('connection', (socket: Socket) => {
            socket.on(WebSocketEvents.ChatJoin, async (chatId: string) => {
                socket.join(chatId);
            });
            socket.on(WebSocketEvents.ChatLeave, (chatId: string) => {
                socket.leave(chatId);
            });
        });
    }

    private watchChats(): void {
        const collection = this.mongo.db.collection<RepoChat>(
            CollectionId.RepoChat,
        );
        const changeStream: ChangeStream<RepoChat> = collection.watch(
            [
                {
                    $match: {
                        operationType: 'update',
                        // Only react if status changed
                        'updateDescription.updatedFields.status': {
                            $exists: true,
                        },
                    },
                },
            ],
            {
                fullDocument: 'updateLookup',
            },
        );

        changeStream.on(
            'change',
            (change: ChangeStreamUpdateDocument<RepoChat>) => {
                const chat = change.fullDocument;
                if (!chat) return;

                const chatId = chat._id.toHexString();

                // Only emit if someone is actually listening
                const room = this.io.sockets.adapter.rooms.get(chatId);
                if (!room || room.size === 0) return;

                this.io.to(chatId).emit(WebSocketEvents.ChatStatus, chat);
            },
        );
    }

    private watchChatLogs(): void {
        const collection = this.mongo.db.collection<RepoLog>(
            CollectionId.RepoLog,
        );
        const changeStream = collection.watch(
            [{ $match: { operationType: 'insert' } }],
            { fullDocument: 'updateLookup' },
        );

        // Watch for inserts and send to appropriate chats.
        changeStream.on(
            'change',
            (change: ChangeStreamInsertDocument<RepoLog>) => {
                const log = change.fullDocument;
                const chatId = log._id.toHexString();
                const room = this.io.sockets.adapter.rooms.get(chatId);
                if (!room || room.size === 0) {
                    return;
                }

                // Share most recent log to specific chat.
                this.io.to(chatId).emit(WebSocketEvents.ChatLog, log);
            },
        );
    }

    private watchChatMessages(): void {
        // Liste to messages, both inserts & updates.
        const collection = this.mongo.db.collection<RepoMessage>(
            CollectionId.RepoMessage,
        );
        const changeStream: ChangeStream<RepoMessage> = collection.watch(
            [
                {
                    $match: {
                        operationType: { $in: ['insert', 'update'] },
                    },
                },
            ],
            { fullDocument: 'updateLookup' },
        );

        // On change, send to respetive chat.
        changeStream.on(
            'change',
            (
                change:
                    | ChangeStreamInsertDocument<RepoMessage>
                    | ChangeStreamUpdateDocument<RepoMessage>,
            ) => {
                const message = change.fullDocument;
                if (!message) {
                    return;
                }

                const chatId = message.chatId.toHexString();
                const room = this.io.sockets.adapter.rooms.get(chatId);
                if (!room || room.size === 0) {
                    return;
                }
                this.io.to(chatId).emit(WebSocketEvents.ChatMessage, message);
            },
        );
    }
}
