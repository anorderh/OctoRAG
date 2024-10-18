import { ObjectId } from "mongodb";
import { ResourceType } from "src/data/utils/constants/resource-type";

export interface ConfirmResourceRequest {
    _libraryId: string;
    path: string;
    type: ResourceType;
}