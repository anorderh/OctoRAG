import { DateOption } from "src/routing/utils/constants/date-options";

export function calcDateRange(option: DateOption) : [Date, Date] {
    let currDate = new Date();
    let startDate = new Date();

    switch (option) {
        case DateOption.LAST_YEAR: {
            startDate.setFullYear(startDate.getFullYear() - 1);
            break;
        }
        case DateOption.LAST_MONTH: {
            startDate.setMonth(startDate.getMonth() - 1);
            break;
        }
        case DateOption.LAST_WEEK: {
            startDate.setDate(startDate.getDate() - 1);
            break;
        }
    }
    startDate.setHours(0, 0, 0, 0); // Ignore time.

    return [
        startDate,
        currDate
    ]
}   