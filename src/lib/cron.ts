import { CronExpressionParser } from 'cron-parser'

/**
 * Calculate the next run date from a cron expression.
 * Uses UTC timezone consistently.
 */
export function getNextRunDate(cronExpression: string, fromDate?: Date): Date {
  const interval = CronExpressionParser.parse(cronExpression, {
    currentDate: fromDate || new Date(),
    tz: 'UTC',
  })
  return interval.next().toDate()
}

/**
 * Get a human-readable description of a cron expression in Spanish.
 */
export function describeCron(cronExpression: string): string {
  const parts = cronExpression.split(' ')
  if (parts.length !== 5) return cronExpression

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts

  const dayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
  const monthNames = ['', 'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

  if (dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    return `Cada día a las ${hour}:${minute.padStart(2, '0')} UTC`
  }
  if (dayOfMonth === '*' && month === '*' && dayOfWeek !== '*') {
    const day = dayNames[parseInt(dayOfWeek)] || dayOfWeek
    return `Cada ${day} a las ${hour}:${minute.padStart(2, '0')} UTC`
  }
  if (dayOfMonth !== '*' && month !== '*') {
    const months = month.split(',').map(m => monthNames[parseInt(m)] || m).join(', ')
    return `El día ${dayOfMonth} de ${months} a las ${hour}:${minute.padStart(2, '0')} UTC`
  }
  if (dayOfMonth !== '*' && month === '*') {
    return `El día ${dayOfMonth} de cada mes a las ${hour}:${minute.padStart(2, '0')} UTC`
  }
  return cronExpression
}
