import mongoose, { Model, model } from "mongoose";
import { Service } from "../utils/interfaces/service.interface";
import { env } from "../env";
import { injectable } from "tsyringe";
import { Account, AccountInfo, AccountRequest, AccountStats, Credentials, Resource, Workspace, accountInfoSchema, accountRequestSchema, accountSchema, accountStatsSchema, credentialsSchema, resourceSchema, workspaceSchema } from "../data/schema";
import { RefreshToken, refreshTokenSchema } from "../data/schema/auth.refresh-token.schema";

@injectable()
export class MongoService extends Service {
    models = {
        auth: {
            account: model<Account>('Account', accountSchema),
            accountInfo: model<AccountInfo>('AccountInfo', accountInfoSchema),
            accountStats: model<AccountStats>('AccountStats', accountStatsSchema),
            accountRequest: model<AccountRequest>('AccountRequest', accountRequestSchema),
            credentials: model<Credentials>('Credentials', credentialsSchema),
            refreshToken: model<RefreshToken>('RefreshToken', refreshTokenSchema)
        },
        storage: {
            resource: model<Resource>('Resource', resourceSchema),
            workspace: model<Workspace>('Workspace', workspaceSchema),
        }
    }

    initialize() {
        return mongoose.connect(env.mongo.connStr).then(() => {
            console.log("Mongoose successfully setup.")
        });
    }
}