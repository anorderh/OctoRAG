import { DateOption } from "../../../utils/enums/board-filtering/date-options";
import { SortingOption } from "../../../utils/enums/board-filtering/sorting-options";
import { FindType } from "../../../utils/enums/find-type";
import { Pagination } from "../../../utils/interfaces/pagination";

export interface SearchBoardParams {
    includedTypes?: FindType[]
    excludedTypes?: FindType[]
    searchStr?: string
    tagIds?: string[],
    createdAtDateRange: DateOption
    updatedAtDateRange: DateOption
    sort: SortingOption,
}

export class SearchBoardRequest {
    input: SearchBoardParams;

    constructor(input: SearchBoardParams) {
        // Apply defaults if not present.
        input = {
            includedTypes: [],
            excludedTypes: [],
            searchStr: "",
            tagIds: [],
            ...input
        } as SearchBoardParams;
    }
}