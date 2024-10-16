import { Board } from "src/data/collections/board.collection";
import { InvalidBoardError } from "src/error-handling/errors";
import { httpContext } from "src/routing/middleware/http-context";
import { MongoCheck } from "src/data/utils/types/mongo-check";

export const hasBoardAuth : MongoCheck<Board | null> = (board) => {
    let userId = httpContext().userId;
    if (userId == null || board == null || !board.creatorId.equals(userId)) {
        throw new InvalidBoardError({
            body: "User is not authorized to access this board."
        })
    }
}