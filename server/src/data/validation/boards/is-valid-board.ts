import { Board } from "src/data/collections/board.collection"
import { InvalidBoardError } from "src/error-handling/errors"
import { MongoCheck } from "src/data/utils/types/mongo-check"

export const isValidBoard : MongoCheck<Board | null> = (board) => {
    if (board == null) {
        throw new InvalidBoardError({
            body: "Board does not exist."
        })
    }
}