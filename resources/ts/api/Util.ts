export const parseHtmlDate = (rawDate: string): Date | void => {
    const [date, rawTime] = rawDate.split(" ");
    if (typeof date === "string" && typeof rawTime === "string") {
        const timeMatch = rawTime.match(/<b>([0-9]{1,2}):([0-9]{1,2})<\/b>/);
        if (timeMatch) {
            return new Date(`${date} ${timeMatch[1]}:${timeMatch[2]}`);
        }
    }
}
