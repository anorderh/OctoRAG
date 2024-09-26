import { Board } from "src/data/collections/board.js";

export class BoardHelpers {
    public static getMostRecentVersion(board: Board) {
        return board.versions.reduce((max, curr)=> {
            return curr.index > max.index ? curr : max;
        })
    }
}