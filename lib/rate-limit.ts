// Limite le nombre de tentatives par adresse (en mémoire : efficace contre un essai massif
// depuis une même adresse ; Supabase applique aussi ses propres limites).

export function makeLimiter(max: number, windowMs: number) {
  const hits = new Map<string, { count: number; first: number }>();
  return {
    tooMany(key: string): boolean {
      const h = hits.get(key);
      if (!h) return false;
      if (Date.now() - h.first > windowMs) {
        hits.delete(key);
        return false;
      }
      return h.count >= max;
    },
    record(key: string) {
      const h = hits.get(key);
      if (!h || Date.now() - h.first > windowMs) hits.set(key, { count: 1, first: Date.now() });
      else h.count += 1;
    },
    clear(key: string) {
      hits.delete(key);
    },
  };
}
