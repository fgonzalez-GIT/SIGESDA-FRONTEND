/**
 * Date Helpers para manejo de fechas ISO 8601
 *
 * Todas las fechas en el backend usan formato ISO 8601 completo con timezone.
 * Ejemplo: "2025-11-26T10:00:00.000Z"
 */

/**
 * Convierte un objeto Date a string ISO 8601
 */
export function toISO8601(date: Date): string {
  return date.toISOString();
}

/**
 * Convierte un string ISO 8601 a objeto Date
 */
export function fromISO8601(dateString: string): Date {
  return new Date(dateString);
}

/**
 * Calcula la duración en minutos entre dos fechas
 */
export function calculateDuration(start: string | Date, end: string | Date): number {
  const startDate = typeof start === 'string' ? fromISO8601(start) : start;
  const endDate = typeof end === 'string' ? fromISO8601(end) : end;

  const durationMs = endDate.getTime() - startDate.getTime();
  return Math.floor(durationMs / (1000 * 60)); // Convertir a minutos
}

/**
 * Valida que la duración esté entre 30 minutos y 12 horas
 */
export function validateDuration(start: string | Date, end: string | Date): boolean {
  const durationMinutes = calculateDuration(start, end);
  return durationMinutes >= 30 && durationMinutes <= 720; // 30 min - 12 horas
}

/**
 * Verifica si una fecha está en el pasado (permite hasta 1 hora atrás)
 */
export function isInPast(date: string | Date, flexibilityHours: number = 1): boolean {
  const checkDate = typeof date === 'string' ? fromISO8601(date) : date;
  const now = new Date();
  const flexibilityMs = flexibilityHours * 60 * 60 * 1000;
  const threshold = new Date(now.getTime() - flexibilityMs);

  return checkDate < threshold;
}

/**
 * Verifica si una fecha/hora está en el futuro
 */
export function isInFuture(date: string | Date): boolean {
  const checkDate = typeof date === 'string' ? fromISO8601(date) : date;
  const now = new Date();
  return checkDate > now;
}

/**
 * Formatea una fecha ISO 8601 a formato legible en español
 * Ejemplo: "26/11/2025 10:00"
 */
export function formatDateTimeES(dateString: string): string {
  const date = fromISO8601(dateString);
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formatea solo la fecha en español
 * Ejemplo: "26/11/2025"
 */
export function formatDateES(dateString: string): string {
  const date = fromISO8601(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Formatea solo la hora
 * Ejemplo: "10:00"
 */
export function formatTimeES(dateString: string): string {
  const date = fromISO8601(dateString);
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formatea duración en minutos a string legible
 * Ejemplo: 90 minutos -> "1h 30min"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}min`;
}

/**
 * Obtiene el día de la semana en español
 * 0 = Domingo, 6 = Sábado
 */
export function getDayOfWeek(dateString: string): number {
  const date = fromISO8601(dateString);
  return date.getDay();
}

/**
 * Obtiene el nombre del día de la semana en español
 */
export function getDayOfWeekName(dateString: string): string {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const dayIndex = getDayOfWeek(dateString);
  return days[dayIndex];
}

/**
 * Verifica si dos rangos de fechas se solapan
 */
export function doRangesOverlap(
  start1: string | Date,
  end1: string | Date,
  start2: string | Date,
  end2: string | Date
): boolean {
  const s1 = typeof start1 === 'string' ? fromISO8601(start1) : start1;
  const e1 = typeof end1 === 'string' ? fromISO8601(end1) : end1;
  const s2 = typeof start2 === 'string' ? fromISO8601(start2) : start2;
  const e2 = typeof end2 === 'string' ? fromISO8601(end2) : end2;

  // Dos rangos se solapan si: (inicio1 < fin2) AND (fin1 > inicio2)
  return s1 < e2 && e1 > s2;
}

/**
 * Agrega horas a una fecha
 */
export function addHours(date: string | Date, hours: number): string {
  const d = typeof date === 'string' ? fromISO8601(date) : date;
  const result = new Date(d.getTime() + hours * 60 * 60 * 1000);
  return toISO8601(result);
}

/**
 * Agrega minutos a una fecha
 */
export function addMinutes(date: string | Date, minutes: number): string {
  const d = typeof date === 'string' ? fromISO8601(date) : date;
  const result = new Date(d.getTime() + minutes * 60 * 1000);
  return toISO8601(result);
}

/**
 * Agrega días a una fecha
 */
export function addDays(date: string | Date, days: number): string {
  const d = typeof date === 'string' ? fromISO8601(date) : date;
  const result = new Date(d.getTime() + days * 24 * 60 * 60 * 1000);
  return toISO8601(result);
}

/**
 * Verifica si una fecha es hoy
 */
export function isToday(date: string | Date): boolean {
  const d = typeof date === 'string' ? fromISO8601(date) : date;
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

/**
 * Verifica si una reserva está actualmente en curso
 * (now >= fechaInicio AND now <= fechaFin)
 */
export function isCurrentlyActive(fechaInicio: string, fechaFin: string): boolean {
  const now = new Date();
  const inicio = fromISO8601(fechaInicio);
  const fin = fromISO8601(fechaFin);
  return now >= inicio && now <= fin;
}

/**
 * Convierte una fecha a formato YYYY-MM-DD (para inputs de tipo date)
 */
export function toDateInputFormat(date: string | Date): string {
  const d = typeof date === 'string' ? fromISO8601(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Convierte una fecha a formato HH:mm (para inputs de tipo time)
 */
export function toTimeInputFormat(date: string | Date): string {
  const d = typeof date === 'string' ? fromISO8601(date) : date;
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Combina fecha (YYYY-MM-DD) y hora (HH:mm) en formato ISO 8601
 */
export function combineDateAndTime(dateStr: string, timeStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date(year, month - 1, day, hours, minutes, 0, 0);
  return toISO8601(date);
}

/**
 * Obtiene el inicio del día (00:00:00) para una fecha
 */
export function getStartOfDay(date: string | Date): string {
  const d = typeof date === 'string' ? fromISO8601(date) : date;
  const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  return toISO8601(startOfDay);
}

/**
 * Obtiene el fin del día (23:59:59) para una fecha
 */
export function getEndOfDay(date: string | Date): string {
  const d = typeof date === 'string' ? fromISO8601(date) : date;
  const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
  return toISO8601(endOfDay);
}
