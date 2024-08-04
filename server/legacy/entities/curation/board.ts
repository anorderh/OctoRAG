
import { Schema, model, Types, ObjectId } from "mongoose";
import { Find } from "./find";
import { Tag } from "./tag";

export interface Board {
    id: ObjectId;
    title: string;
    creatorId: ObjectId;
    desc: string;
    followers: ObjectId[];
    tagIds: ObjectId[];
    finds: ObjectId[];
    views: number;
    clicks: number;
    saves: number;
    createdAt: Date;
    updatedAt: Date;
    active: boolean;
}

const boardSchema = new Schema({
    title: {type: String, required: true},
    creatorId: {type: Types.ObjectId, ref: 'User', required: true},
    followers: [{type: Types.ObjectId, ref: 'User', default: []}],
    desc: {type: String},
    finds: [{type: Types.ObjectId, ref: 'Find', default: []}],
    tagIds: [{type: Types.ObjectId, ref: 'Tag', default: []}],
    views: {type: Number, default: 0},
    clicks: {type: Number, default: 0},
    saves: {type: Number, default: 0},
    active: {type: Boolean, default: true},
}, {
    timestamps: true
});

export const Board = model<Board>('Board', boardSchema);

// Plugins.
boardSchema.post('deleteOne', async function (next) {
    const board = await this.model.findOne(this.getQuery()).exec();
    if (!!board) {
        await Find.deleteMany({boardId: board.id}).exec();
        await Tag.updateMany(
            { _id: {$in: board.tagIds }},
            { $pull: { boards: board.id }}
        ).exec()
    }
});
boardSchema.post('updateOne', async function (next) {
    const board = await Board.findOne(this.getQuery()).exec();
    if (!!board) {
        if (board?.isModified('tagIds')) {
            // Clear all tags.
            await Tag.updateMany(
                { _id: { $in: board.tagIds }},
                { $pull: { boards: board.id }}
            ).exec()

            

            await Tag.updateMany(
                { _id: { $in: board.tagIds }},
                { $pull: { boards: board.id }}
            ).exec()
        }
    }
});