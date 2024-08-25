import { Collection, ObjectId } from "mongodb";
import { inject, injectable, Lifecycle, scoped } from "tsyringe";
import { httpContext } from "../routing/middleware/http-context";
import { Board } from "../data/collections";
import { BoardController } from "../routing/controllers/board";
import { MongoService } from "./mongo.service";
import { CollectionId } from "../utils/enums/collection-id";
import { InvalidBoardError } from "../error-handling/errors";


@injectable()
export class BoardService {
    boardCollection: Collection<Board>;

    constructor(
        @inject(MongoService) private mongo: MongoService
    ) {
        this.boardCollection = this.mongo.db.collection<Board>(CollectionId.Board);
    }
}