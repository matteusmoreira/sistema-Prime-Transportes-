/**
 * Formata uma hora do formato 24h para 12h com AM/PM
 * @param time - Hora no formato HH:mm ou HH:mm:ss
 * @returns Hora formatada no formato 12h com AM/PM
 */
export const formatTimeToAmPm = (time: string): string => {
  if (!time) return 'Não informado';
  
  // Remove seconds if present (HH:mm:ss -> HH:mm)
  const timeParts = time.split(':');
  if (timeParts.length < 2) return time;
  
  const hours = parseInt(timeParts[0], 10);
  const minutes = timeParts[1];
  
  if (isNaN(hours)) return time;
  
  // Convert to 12-hour format
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  
  return `${hours12.toString().padStart(2, '0')}:${minutes} ${period}`;
};

/**
 * Remove segundos de uma hora
 * @param time - Hora no formato HH:mm ou HH:mm:ss
 * @returns Hora formatada no formato HH:mm (sem segundos)
 */
export const removeSecondsFromTime = (time: string): string => {
  if (!time) return '';
  
  // Remove seconds if present (HH:mm:ss -> HH:mm)
  const timeParts = time.split(':');
  if (timeParts.length >= 2) {
    return `${timeParts[0]}:${timeParts[1]}`;
  }
  
  return time;
};

/**
 * Formata hora para 24h (HH:mm), mesmo que venha com segundos ou valores fora do range
 * @param time - string de hora (ex: "13:00", "08:30:15")
 * @returns Hora normalizada no formato HH:mm ou "Não informado" se vazia
 */
export const formatTime24h = (time: string): string => {
  if (!time) return 'Não informado';
  const timeParts = time.split(':');
  if (timeParts.length >= 2) {
    const h = Math.max(0, Math.min(23, parseInt(timeParts[0] || '0', 10) || 0));
    const m = Math.max(0, Math.min(59, parseInt(timeParts[1] || '0', 10) || 0));
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
  return time;
};