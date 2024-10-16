import { Board } from "src/data/collections/board.collection";

export class BoardUtility {
    public static getMostRecentVersion(board: Board) {
        return board.versions.reduce((max, curr)=> {
            return curr.index > max.index ? curr : max;
        })
    }
}