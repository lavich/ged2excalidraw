import { Individual, Family } from './models';

export function assignGenerations(
  individuals: Map<string, Individual>,
  families: Map<string, Family>
): Map<string, number> {
  const { childOf, parentOf } = buildRelationships(individuals, families);
  const roots = [...individuals.keys()].filter(id => !childOf.has(id));

  const generations = new Map<string, number>();
  const visited = new Set<string>();
  const queue: Array<[string, number]> = roots.map(r => [r, 0]);

  while (queue.length > 0) {
    const [personId, gen] = queue.shift()!;
    if (visited.has(personId)) continue;
    visited.add(personId);
    generations.set(personId, Math.min(generations.get(personId) ?? gen, gen));

    const indi = individuals.get(personId)!;
    for (const famId of indi.familiesSpouse) {
      const fam = families.get(famId);
      if (!fam) continue;
      const spouseId = fam.husband === personId ? fam.wife : fam.husband;
      if (spouseId && !visited.has(spouseId)) {
        queue.push([spouseId, gen]);
        generations.set(spouseId, gen);
      }
    }

    for (const childId of parentOf.get(personId) ?? []) {
      if (!visited.has(childId)) {
        queue.push([childId, gen + 1]);
      }
    }
  }

  const maxGen = Math.max(0, ...generations.values());
  for (const iid of individuals.keys()) {
    if (!generations.has(iid)) {
      generations.set(iid, maxGen + 1);
    }
  }

  return generations;
}

function buildRelationships(
  individuals: Map<string, Individual>,
  families: Map<string, Family>
): { childOf: Map<string, string>; parentOf: Map<string, string[]> } {
  const childOf = new Map<string, string>();
  const parentOf = new Map<string, string[]>();

  for (const [famId, fam] of families) {
    for (const childId of fam.children) {
      childOf.set(childId, famId);
    }
    if (fam.husband) {
      const list = parentOf.get(fam.husband) ?? [];
      list.push(...fam.children);
      parentOf.set(fam.husband, list);
    }
    if (fam.wife) {
      const list = parentOf.get(fam.wife) ?? [];
      list.push(...fam.children);
      parentOf.set(fam.wife, list);
    }
  }

  return { childOf, parentOf };
}
