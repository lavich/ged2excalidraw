import { Individual, Family } from './models';

const CARD_W = 180;
const CARD_H = 60;
const FAMILY_BLOCK_H = 30;
const H_GAP = 20;
const V_GAP = 60;
const SPOUSE_GAP = 10;
const FAMILY_PAD = 15;
const ROW_H = CARD_H + V_GAP + FAMILY_BLOCK_H + V_GAP;

export function layoutTree(
  individuals: Map<string, Individual>,
  families: Map<string, Family>,
  _generations: Map<string, number>
): Map<string, [number, number]> {
  const { childOf, parentOf, familyOfSpouse } = buildIndex(individuals, families);

  const rootFams: string[] = [];
  for (const [fid, fam] of families) {
    let isRoot = true;
    for (const pid of [fam.husband, fam.wife]) {
      if (pid && childOf.has(pid)) {
        isRoot = false;
        break;
      }
    }
    if (isRoot && (fam.husband || fam.wife || fam.children.length > 0)) {
      rootFams.push(fid);
    }
  }

  const placed = new Set<string>();
  const positions = new Map<string, [number, number]>();

  let yCursor = 0;
  for (const fid of rootFams) {
    const [, subH] = familySize(fid, families, familyOfSpouse);
    layoutFamily(fid, 0, yCursor, families, familyOfSpouse, positions, placed);
    yCursor += subH + V_GAP;
  }

  for (const pid of individuals.keys()) {
    if (!placed.has(pid)) {
      positions.set(pid, [0, yCursor]);
      yCursor += CARD_H + V_GAP;
    }
  }

  return positions;
}

function buildIndex(
  individuals: Map<string, Individual>,
  families: Map<string, Family>
): { childOf: Map<string, string>; parentOf: Map<string, string[]>; familyOfSpouse: Map<string, string> } {
  const childOf = new Map<string, string>();
  const parentOf = new Map<string, string[]>();
  const familyOfSpouse = new Map<string, string>();

  for (const [fid, fam] of families) {
    for (const cid of fam.children) {
      childOf.set(cid, fid);
    }
    if (fam.husband) {
      const list = parentOf.get(fam.husband) ?? [];
      list.push(...fam.children);
      parentOf.set(fam.husband, list);
      familyOfSpouse.set(fam.husband, fid);
    }
    if (fam.wife) {
      const list = parentOf.get(fam.wife) ?? [];
      list.push(...fam.children);
      parentOf.set(fam.wife, list);
      familyOfSpouse.set(fam.wife, fid);
    }
  }

  return { childOf, parentOf, familyOfSpouse };
}

function familySize(
  fid: string,
  families: Map<string, Family>,
  familyOfSpouse: Map<string, string>
): [number, number] {
  const fam = families.get(fid)!;

  let parentsW = CARD_W;
  if (fam.husband && fam.wife) {
    parentsW = CARD_W * 2 + SPOUSE_GAP;
  }

  const children = fam.children;
  if (children.length === 0) {
    return [parentsW + FAMILY_PAD * 2, CARD_H + FAMILY_PAD * 2];
  }

  const childSizes: Array<[number, number]> = [];
  for (const cid of children) {
    if (familyOfSpouse.has(cid)) {
      const subFid = familyOfSpouse.get(cid)!;
      childSizes.push(familySize(subFid, families, familyOfSpouse));
    } else {
      childSizes.push([CARD_W, CARD_H]);
    }
  }

  const totalChildW = childSizes.reduce((sum, [w]) => sum + w, 0) + H_GAP * (childSizes.length - 1);
  const maxChildH = Math.max(...childSizes.map(([, h]) => h));

  const w = Math.max(parentsW, totalChildW) + FAMILY_PAD * 2;
  const h = ROW_H + maxChildH + FAMILY_PAD * 2;
  return [w, h];
}

function layoutFamily(
  fid: string,
  x0: number,
  y0: number,
  families: Map<string, Family>,
  familyOfSpouse: Map<string, string>,
  positions: Map<string, [number, number]>,
  placed: Set<string>
): void {
  const fam = families.get(fid)!;

  const parentIds = [fam.husband, fam.wife].filter(Boolean) as string[];
  let parentsW = CARD_W;
  if (parentIds.length === 2) {
    parentsW = CARD_W * 2 + SPOUSE_GAP;
  }

  const [famW] = familySize(fid, families, familyOfSpouse);
  const parentXStart = x0 + (famW - parentsW) / 2;

  for (let i = 0; i < parentIds.length; i++) {
    const pid = parentIds[i];
    const px = parentXStart + i * (CARD_W + SPOUSE_GAP);
    const py = y0 + FAMILY_PAD;
    positions.set(pid, [px, py]);
    placed.add(pid);
  }

  const children = fam.children;
  if (children.length === 0) return;

  const childInfo: Array<[string, number, number]> = [];
  for (const cid of children) {
    if (familyOfSpouse.has(cid)) {
      const subFid = familyOfSpouse.get(cid)!;
      const [sw, sh] = familySize(subFid, families, familyOfSpouse);
      childInfo.push([cid, sw, sh]);
    } else {
      childInfo.push([cid, CARD_W, CARD_H]);
    }
  }

  const totalChildW = childInfo.reduce((sum, [, w]) => sum + w, 0) + H_GAP * (childInfo.length - 1);
  let childRowX = x0 + (famW - totalChildW) / 2;
  const childY = y0 + FAMILY_PAD + CARD_H + V_GAP + FAMILY_BLOCK_H + V_GAP;

  for (const [cid, cw] of childInfo) {
    positions.set(cid, [childRowX, childY]);
    placed.add(cid);

    if (familyOfSpouse.has(cid)) {
      const subFid = familyOfSpouse.get(cid)!;
      layoutFamily(subFid, childRowX, childY + CARD_H + V_GAP, families, familyOfSpouse, positions, placed);
    }

    childRowX += cw + H_GAP;
  }
}
