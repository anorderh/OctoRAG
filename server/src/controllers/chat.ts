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
import { UserService } from 'src/services/user.service.js';
import { inject, singleton } from 'tsyringe';
import {
    Authorize,
    Controller,
    Delete,
    Get,
    Post,
} from '../controllers/decorators/index.js';
import { Validate } from '../controllers/decorators/validate.js';
import {
    ChatClearChatRequest,
    ChatClearChatResponse,
    ChatCreateChatRequest,
    ChatCreateChatResponse,
    ChatDeleteChatRequest,
    ChatDeleteChatResponse,
    ChatGetChatsResponse,
    ChatGetDetailsRequest,
    ChatGetDetailsResponse,
    ChatRunScrapeRequest,
    ChatRunScrapeResponse,
    ChatSendMessageRequest,
    ChatSendMessageResponse,
} from './dto/chat.js';
import { httpContext } from './middleware/http-context.js';
import { ControllerBase } from './shared/abstract/controller.abstract.js';
import { objectId } from './shared/constants/objectid-validation.js';
import { ControllerRequest } from './shared/interfaces/controller-request.js';
import { githubRepoUrl } from './util/githubRepo.validator.js';

@Controller('/chat')
@singleton()
export class ChatController extends ControllerBase {
    constructor(
        @inject(MongoService) private mongo: MongoService,
        @inject(RagService) private rag: RagService,
        @inject(UserService) private userService: UserService,
    ) {
        super();
    }

    @Get('/')
    @Authorize()
    public async getChats(req: ControllerRequest, res: ChatGetChatsResponse) {
        const user = await this.userService.getSelf();
        const chats = await this.mongo.getChats((await user)._id);
        res.status(200).send({
            message: "User's chats retrieved.",
            data: {
                chats,
            },
        });
    }

    @Get('/:chatId')
    @Authorize()
    public async getChat(
        req: ChatGetDetailsRequest,
        res: ChatGetDetailsResponse,
    ) {
        const { chatId } = req.params;
        const userId = httpContext().userId;

        const chat = await this.mongo.collections.repoChat.findOne({
            _id: new ObjectId(chatId),
            userId: userId,
        });
        if (!chat) {
            return res.status(409).send({
                message: 'Chat not found.',
            });
        }
        const messages = await this.mongo.collections.repoMessage
            .find({ chatId: chat._id })
            .sort({ creationDate: 1 })
            .toArray();
        const logs = await this.mongo.collections.repoLog
            .find({ chatId: chat._id })
            .sort({ creationDate: 1 })
            .toArray();
        const dto = {
            chat,
            messages,
            logs,
        };
        return res.status(200).send({
            message: `Chat ${chatId} details retrieved successfully.`,
            data: dto,
        });
    }

    @Post('/new')
    @Validate('body', {
        repoName: Joi.string().required(),
        repoUrl: githubRepoUrl,
    })
    @Authorize()
    public async createChat(
        req: ChatCreateChatRequest,
        res: ChatCreateChatResponse,
    ) {
        let repoChatPost: RepoChatPost = req.body;
        let repoChatInsert: RepoChatEntity = {
            ...repoChatPost,
            userId: httpContext().userId,
            creationDate: new Date(),
            lastMessageDate: null,
            messageCount: 0,
            status: ChatStatus.IDLE,
        };
        const collection = this.mongo.db.collection<RepoChatEntity>(
            CollectionId.RepoChat,
        );
        const result = await collection.insertOne(repoChatInsert);
        const insertedChat = await collection.findOne({
            _id: result.insertedId,
        });

        res.status(200).send({
            message: `Chat ${insertedChat._id} created successfully`,
            data: {
                chat: insertedChat,
            },
        });
    }

    @Post('/:chatId/run')
    @Validate('params', {
        chatId: objectId.required(),
    })
    @Authorize()
    public async runChatScrape(
        req: ChatRunScrapeRequest,
        res: ChatRunScrapeResponse,
    ) {
        const chatId = new ObjectId(req.params.chatId);
        const chat = await this.mongo.collections.repoChat.findOne({
            _id: chatId,
        });
        await this.mongo.collections.repoChat.updateOne(
            {
                _id: chatId,
            },
            {
                $set: {
                    status: ChatStatus.LOADING,
                },
            },
        );

        // Re-run scrape for existing Github repo chat.
        Tasks.run(async () => {
            await this.rag.prepareGithubRepoChat(chat);
        });
        res.status(200).send({
            message: `Scrape for chat ${chat._id.toHexString()} was started.`,
        });
    }

    @Post('/:chatId')
    @Validate('params', {
        chatId: objectId.required(),
    })
    @Validate('body', {
        input: Joi.string().required(),
    })
    @Authorize()
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
            CollectionId.RepoMessage,
        );
        const result = await collection.insertOne(repoMessageInsert);
        const insertedMessage = await collection.findOne({
            _id: result.insertedId,
        });
        await this.mongo.collections.repoChat.updateOne(
            { _id: insertedMessage.chatId },
            {
                $set: {
                    lastMessageDate: new Date(),
                },
                $inc: {
                    messageCount: 1,
                },
            },
        );

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
    @Authorize()
    public async deleteChat(
        req: ChatDeleteChatRequest,
        res: ChatDeleteChatResponse,
    ) {
        const chatId = new ObjectId(req.params.chatId);

        const result = await this.mongo.collections.repoChat.deleteOne({
            _id: chatId,
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
    @Authorize()
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
}
