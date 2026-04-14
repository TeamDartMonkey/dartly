export function isOverdue(deadline: string): boolean {
  return deadline < new Date().toISOString().slice(0, 10);
}
