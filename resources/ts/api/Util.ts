export const parseHtmlDate = (rawDate: string): Date | void => {
    if (!rawDate) {
        return;
    }

    const [date, rawTime] = rawDate.split(" ");

    if (typeof date !== "string" || typeof rawTime !== "string") {
        console.error(`Invalid date: ${rawDate}`);
        return;
    }

    const timeMatch = rawTime.match(/<b>([0-9]{1,2}):([0-9]{1,2})<\/b>/);
    if (!timeMatch) {
        console.error(`Failed parsing time: ${rawTime}`);
        return;
    }

    return new Date(`${date} ${timeMatch[1]}:${timeMatch[2]}`);
}
