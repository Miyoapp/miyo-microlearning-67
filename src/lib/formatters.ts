
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

/**
 * Formats currency based on the currency code
 * @param amount The amount to format
 * @param currency The currency code (optional, defaults to USD)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency?: string): string {
  const curr = currency || 'USD';
  switch (curr) {
    case 'USD':
      return `$${amount.toFixed(2)}`;
    case 'EUR':
      return `€${amount.toFixed(2)}`;
    case 'MXN':
      return `$${amount.toFixed(2)} MXN`;
    case 'ARS':
      return `$${amount.toFixed(0)} ARS`;
    case 'PEN':
      return `S/${amount.toFixed(2)}`;
    default:
      return `${curr} $${amount.toFixed(2)}`;
  }
}
