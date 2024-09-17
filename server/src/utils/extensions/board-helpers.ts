import { Board } from "src/data/collections";

export class BoardHelpers {
    public static getMostRecentVersion(board: Board) {
        return board.versions.reduce((max, curr)=> {
            return curr.index > max.index ? curr : max;
        })
    }
}