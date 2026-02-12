import Joi from 'joi';
import { ObjectId } from 'mongodb';
import { Tasks } from 'src/core/Tasks.js';
import {
    RepoChatEntity,
    RepoChatPost,
} from 'src/database/entities/repo-chat/repo-chat.js';
import {
    RepoMessageEntity,
    RepoMessageInsert,
    RepoMessagePost,
} from 'src/database/entities/repo-message/repo-message.js';
import { ChatStatus } from 'src/database/shared/constants/chat-status.enum.js';
import { CollectionId } from 'src/database/shared/constants/collection-id.js';
import { MongoService } from 'src/services/mongo.service.js';
import { RagService } from 'src/services/rag.service.js';
import { inject, singleton } from 'tsyringe';
import { Controller, Delete, Post } from '../controllers/decorators/index.js';
import { Validate } from '../controllers/decorators/validate.js';
import {
    ChatClearChatRequest,
    ChatClearChatResponse,
    ChatCreateChatRequest,
    ChatCreateChatResponse,
    ChatDeleteChatRequest,
    ChatDeleteChatResponse,
    ChatRerunScrapeRequest,
    ChatRerunScrapeResponse,
    ChatSendMessageRequest,
    ChatSendMessageResponse,
} from './dto/chat.js';
import { ControllerBase } from './shared/abstract/controller.abstract.js';
import { objectId } from './shared/constants/objectid-validation.js';
import { githubRepoUrl } from './util/githubRepo.validator.js';

@Controller('/chat')
@singleton()
export class ChatController extends ControllerBase {
    constructor(
        @inject(MongoService) private mongo: MongoService,
        @inject(RagService) private rag: RagService,
    ) {
        super();
    }

    @Post('/new')
    @Validate('body', {
        repoName: Joi.string().required(),
        repoUrl: githubRepoUrl,
    })
    public async createChat(
        req: ChatCreateChatRequest,
        res: ChatCreateChatResponse,
    ) {
        let repoChatPost: RepoChatPost = req.body;
        let repoChatInsert: RepoChatEntity = {
            ...repoChatPost,
            creationDate: new Date(),
            lastMessageDate: null,
            messageCount: 0,
            status: ChatStatus.LOADING,
        };
        const collection = this.mongo.db.collection<RepoChatEntity>(
            CollectionId.RepoChat,
        );
        const result = await collection.insertOne(repoChatInsert);
        const insertedChat = await collection.findOne({
            _id: result.insertedId,
        });

        //Schedule chat getting created.
        Tasks.run(async () => {
            await this.rag.prepareGithubRepoChat(insertedChat);
        });
        res.status(200).send({
            message: `Chat ${insertedChat._id} created successfully`,
            data: {
                chat: insertedChat,
            },
        });
    }

    @Post('/:chatId')
    @Validate('params', {
        chatId: objectId.required(),
    })
    @Validate('body', {
        input: Joi.string().required(),
    })
    public async message(
        req: ChatSendMessageRequest,
        res: ChatSendMessageResponse,
    ) {
        let chatId: string = req.params.chatId;
        let repoMessagePost: RepoMessagePost = req.body;
        let repoMessageInsert: RepoMessageInsert = {
            chatId: new ObjectId(chatId),
            source: 'user',
            content: repoMessagePost.input,
            loading: false,
            date: new Date(),
        };
        const collection = this.mongo.db.collection<RepoMessageEntity>(
            CollectionId.RepoChat,
        );
        const result = await collection.insertOne(repoMessageInsert);
        const insertedMessage = await collection.findOne({
            _id: result.insertedId,
        });

        Tasks.run(async () => {
            await this.rag.sendMessageToGithubRepoChat(insertedMessage);
        });
        res.status(200).send({
            message: `Message ${insertedMessage._id} submitted successfully`,
            data: {
                message: insertedMessage,
            },
        });
    }

    @Delete('/:chatId')
    @Validate('params', {
        chatId: objectId.required(),
    })
    public async deleteChat(
        req: ChatDeleteChatRequest,
        res: ChatDeleteChatResponse,
    ) {
        const chatId = new ObjectId(req.params.chatId);
        const result = await this.mongo.collections.repoChat.deleteOne({
            chatId: chatId,
        });
        res.status(200).send({
            message: `Chat ${chatId.toHexString()} was deleted.`,
            data: {
                deletedCount: result.deletedCount,
            },
        });
    }

    @Delete('/:chatId/clear')
    @Validate('params', {
        chatId: objectId.required(),
    })
    public async clearChat(
        req: ChatClearChatRequest,
        res: ChatClearChatResponse,
    ) {
        const chatId = new ObjectId(req.params.chatId);
        const result = await this.mongo.collections.repoMessage.deleteMany({
            chatId: chatId,
        });
        res.status(200).send({
            message: `Scrape for chat ${chatId.toHexString()} was re-run.`,
            data: {
                deletedCount: result.deletedCount,
            },
        });
    }

    @Post('/:chatId/rerun')
    @Validate('params', {
        chatId: objectId.required(),
    })
    public async rerunChatScrape(
        req: ChatRerunScrapeRequest,
        res: ChatRerunScrapeResponse,
    ) {
        const chatId = new ObjectId(req.params.chatId);
        const chat = await this.mongo.collections.repoChat.findOne({
            _id: chatId,
        });

        // Re-run scrape for existing Github repo chat.
        Tasks.run(async () => {
            await this.rag.prepareGithubRepoChat(chat);
        });
        res.status(200).send({
            message: `Scrape for chat ${chat._id.toHexString()} was re-run.`,
        });
    }
}
