import { ObjectId } from "mongodb";
import { Relation } from '../../collections';
import { FindType } from '../../../utils/enums/find-type';

export interface FindResponse {
    _id: ObjectId;
    title: string;
    desc: string;
    link: string;
    type: FindType;
    relations: Relation[];
    grouping: string[];
    rank: number;
    views: number;
    clicks: number;
    createdAt: Date;
    updatedAt: Date;
}
