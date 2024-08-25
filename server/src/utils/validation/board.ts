import { Board } from "../../data/collections"
import { InvalidBoardError } from "../../error-handling/errors"
import { httpContext } from "../../routing/middleware/http-context"
import { MongoCheck } from "../extensions/mongo-checks"

export const isValidBoard : MongoCheck<Board | null> = (board) => {
    if (board == null) {
        throw new InvalidBoardError({
            body: "Board does not exist."
        })
    }
}

export const hasBoardAuth : MongoCheck<Board | null> = (board) => {
    let userId = httpContext().userId;
    if (userId == null || board == null || !board.creatorId.equals(userId)) {
        throw new InvalidBoardError({
            body: "User is not authorized to access this board."
        })
    }
}