
/**
 * Converts minutes to a formatted time string (HH:MM format)
 * @param minutes Number of minutes
 * @returns Formatted time string
 */
export function formatMinutesToTime(minutes: number): string {
  if (!minutes && minutes !== 0) return '0:00';
  
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  
  if (hours > 0) {
    return `${hours}:${mins < 10 ? '0' : ''}${mins}`;
  } else {
    return `${mins}:00`;  // Format minutes with seconds as 00
  }
}

/**
 * Converts minutes to a human-readable duration string
 * @param minutes Number of minutes
 * @returns Human-readable duration string
 */
export function formatMinutesToHumanReadable(minutes: number): string {
  if (!minutes && minutes !== 0) return '0 min';
  
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  
  if (hours > 0) {
    if (mins > 0) {
      return `${hours}h ${mins}min`;
    } else {
      return `${hours}h`;
    }
  } else {
    return `${mins} min`;
  }
}
