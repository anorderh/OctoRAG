import { ResourceType } from 'src/database/shared/constants/resource-type';

export interface ConfirmResourceRequest {
    _libraryId: string;
    path: string;
    type: ResourceType;
}
