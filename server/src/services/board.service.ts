import { Collection, ObjectId } from "mongodb";
import { inject, injectable, Lifecycle, scoped } from "tsyringe";
import { InvalidBoardAccessError } from "../utils/extensions/error-extension-library";
import { httpContext } from "../routing/middleware/http-context";
import { Board } from "../data/collections";
import { BoardController } from "../routing/controllers/board";
import { MongoService } from "./mongo.service";
import { CollectionId } from "../utils/enums/collection-id";


@injectable()
export class BoardService {
    boardCollection: Collection<Board>;

    constructor(
        @inject(MongoService) private mongo: MongoService
    ) {
        this.boardCollection = this.mongo.db.collection<Board>(CollectionId.Board);
    }

    public async getBoard(boardId: ObjectId, checkAuth: boolean = true): Promise<Board> {
        let board = await this.boardCollection.findOne({
            id: boardId
        });
        let userId = httpContext().userId;

        if (board == null) {
            throw new InvalidBoardAccessError("Board does not exist.")
        } else if (checkAuth && board.creatorId != userId) {
            throw new InvalidBoardAccessError("User is not authorized to modify this board.");
        }

        return board;
    }
}