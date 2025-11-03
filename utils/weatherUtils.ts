export const degreesToCardinal = (deg: number): string => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(deg / 22.5) % 16;
  return directions[index];
};

/**
 * Checks if a given date is within British Summer Time (BST).
 * BST starts on the last Sunday of March at 1am UTC and ends on the last Sunday of October at 1am UTC.
 * @param date The date to check.
 * @returns True if the date is in BST, false otherwise.
 */
export const isBST = (date: Date): boolean => {
  const year = date.getFullYear();

  // Find last Sunday in March
  const marchEnd = new Date(Date.UTC(year, 2, 31)); // March is month 2
  const marchLastSunday = new Date(marchEnd);
  marchLastSunday.setUTCDate(marchEnd.getUTCDate() - marchEnd.getUTCDay());
  marchLastSunday.setUTCHours(1, 0, 0, 0);

  // Find last Sunday in October
  const octoberEnd = new Date(Date.UTC(year, 9, 31)); // October is month 9
  const octoberLastSunday = new Date(octoberEnd);
  octoberLastSunday.setUTCDate(octoberEnd.getUTCDate() - octoberEnd.getUTCDay());
  octoberLastSunday.setUTCHours(1, 0, 0, 0);

  const utcDate = date.getTime();

  return utcDate >= marchLastSunday.getTime() && utcDate < octoberLastSunday.getTime();
};

/**
 * Checks if the current time is within the allowed API operational hours.
 * Summer (BST): 7am to 9pm (21:00) local time.
 * Winter (GMT): 7am to 5pm (17:00) local time.
 * @returns True if within operational hours, false otherwise.
 */
export const isWithinApiHours = (): boolean => {
    const now = new Date();
    const currentHour = now.getHours();

    if (isBST(now)) {
        // BST hours: 7am to 9pm (21:00)
        return currentHour >= 7 && currentHour < 21;
    } else {
        // GMT hours: 7am to 5pm (17:00)
        return currentHour >= 7 && currentHour < 17;
    }
};
