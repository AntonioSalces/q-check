function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function shuffledDifferent(ids: string[], correct: string[], seed: string): string[] {
  const arr = [...ids];
  if (arr.length < 2) return arr;
  let state = hash(seed);
  for (let i = arr.length - 1; i > 0; i -= 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const j = state % (i + 1);
    const current = arr[i];
    arr[i] = arr[j] ?? current;
    arr[j] = current;
  }
  const same = arr.every((id, index) => id === correct[index]);
  if (same) {
    const first = arr[0];
    arr.shift();
    if (first !== undefined) arr.push(first);
  }
  return arr;
}
