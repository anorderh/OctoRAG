import { BoardEvent, UserEvent } from "../../../src/utils/constants/event";
import { EventType } from "../../../src/utils/enums/event-type";
import { dummyData } from "../../data";


export = [
    {
        _id: dummyData.events.A.id,
        type: EventType.User,
        event: UserEvent.CreatedBoard,
        occurred: new Date(),
        userId: dummyData.users.A.id,
        ref: dummyData.boards.A.id
    },
    {
        _id: dummyData.events.B.id,
        type: EventType.User,
        event: UserEvent.CreatedBoard,
        occurred: new Date(),
        userId: dummyData.users.B.id,
        ref: dummyData.boards.B.id
    },
    {
        _id: dummyData.events.C.id,
        type: EventType.Board,
        event: BoardEvent.PublishedVersion,
        occurred: new Date(),
        boardId: dummyData.boards.A.id
    },
    {
        _id: dummyData.events.D.id,
        type: EventType.Board,
        event: BoardEvent.PublishedVersion,
        occurred: new Date(),
        boardId: dummyData.boards.B.id
    },
    {
        _id: dummyData.events.E.id,
        type: EventType.Board,
        event: BoardEvent.UpdatedVersion,
        occurred: new Date(),
        boardId: dummyData.boards.B.id
    }
]