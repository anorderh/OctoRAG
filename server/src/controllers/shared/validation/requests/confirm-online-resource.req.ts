import { ObjectId } from "mongodb";
import { OnlineResourceType } from "src/data/utils/constants/online-resource-type";

export interface ConfirmOnlineResourceRequest {
    _libraryId: string;
    url: string;
    type: OnlineResourceType;
}