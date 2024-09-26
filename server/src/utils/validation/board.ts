import { Board } from "../../data/collections/index.js"
import { InvalidBoardError } from "../../error-handling/errors.js"
import { httpContext } from "../../routing/middleware/http-context.js"
import { MongoCheck } from "../extensions/mongo-checks.js"

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