export function getCacheKey(entity: string, userId: string) {
  return JSON.stringify({ entity, userId });
}
