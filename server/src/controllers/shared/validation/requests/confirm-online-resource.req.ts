import { OnlineResourceType } from 'src/database/shared/constants/online-resource-type';

export interface ConfirmOnlineResourceRequest {
    _libraryId: string;
    url: string;
    type: OnlineResourceType;
}
