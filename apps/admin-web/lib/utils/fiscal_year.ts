export function getFiscalYear(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth();

 
  return String(month >= 6 ? year + 1 : year);
}
