/**
 * Probeert een html datum om te zetten naar een Date object.
 * @param rawDate Een html datum in de vorm Datum <b>Tijd</b>.
 * @returns Een datum object van deze tijd.
 */
export const parseHtmlDate = (rawDate: string): Date | void => {
    const [date, rawTime] = rawDate.split(" ");
    if (typeof date === "string" && typeof rawTime === "string") {
        const timeMatch = rawTime.match(/<b>([0-9]{1,2}):([0-9]{1,2})<\/b>/);
        if (timeMatch) {
            return new Date(`${date} ${timeMatch[1]}:${timeMatch[2]}`);
        }
    }
}
