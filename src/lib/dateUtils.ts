/**
 * Get the Monday of the week for a given date.
 * If no date is provided, returns Monday of the current week.
 */
export function getWeekStartDate(date: Date = new Date()): Date {
  const d = new Date(date)
  const day = d.getDay()
  // Sunday is 0, so we need to handle it specially
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Format a date as "Week of Feb 3, 2026"
 */
export function formatWeekDisplay(date: Date): string {
  const weekStart = getWeekStartDate(date)
  return `Week of ${weekStart.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`
}

/**
 * Get the Monday of the next week
 */
export function getNextWeek(date: Date): Date {
  const weekStart = getWeekStartDate(date)
  weekStart.setDate(weekStart.getDate() + 7)
  return weekStart
}

/**
 * Get the Monday of the previous week
 */
export function getPreviousWeek(date: Date): Date {
  const weekStart = getWeekStartDate(date)
  weekStart.setDate(weekStart.getDate() - 7)
  return weekStart
}

/**
 * Check if a date falls within the current week
 */
export function isCurrentWeek(date: Date): boolean {
  const currentWeekStart = getWeekStartDate()
  const targetWeekStart = getWeekStartDate(date)
  return currentWeekStart.getTime() === targetWeekStart.getTime()
}

/**
 * Convert a date to ISO format string (YYYY-MM-DD) for API calls
 */
export function toWeekString(date: Date): string {
  const weekStart = getWeekStartDate(date)
  const year = weekStart.getFullYear()
  const month = String(weekStart.getMonth() + 1).padStart(2, '0')
  const day = String(weekStart.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Parse a week string (YYYY-MM-DD) back to a Date
 */
export function parseWeekString(weekString: string): Date {
  const [year, month, day] = weekString.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/**
 * Get the date for a specific day of the week (0 = Monday, 6 = Sunday)
 */
export function getDayOfWeek(weekStart: Date, dayIndex: number): Date {
  const date = new Date(weekStart)
  date.setDate(date.getDate() + dayIndex)
  return date
}

/**
 * Format a date as "Feb 3"
 */
export function formatDayDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}
